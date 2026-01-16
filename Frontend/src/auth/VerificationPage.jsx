import React, { useState, useEffect } from "react";
import {
  MDBContainer,
  MDBBtn,
  MDBInput,
  MDBCheckbox
} from "mdb-react-ui-kit";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import publicApi from "../services/publicApi";
import ErrorPopup from "../components/ErrorPopup";
import "./verify.css";

export default function Verify() {
  const [mode, setMode] = useState(null);
  const [portalOpen, setPortalOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [theme, setTheme] = useState("light");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* 🔊 Optional ambience */
  useEffect(() => {
    const thunder = document.getElementById("thunder");
    const whisper = document.getElementById("whisper");
    if (thunder) thunder.volume = 0.5;
    if (whisper) whisper.volume = 0.2;
  }, []);

  /* 🔐 LOGIN */
  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      return setError("Enter email and password");
    }

    setPortalOpen(true);

    setTimeout(async () => {
      try {
        const res = await signInWithEmailAndPassword(
          auth,
          loginEmail,
          loginPassword
        );

        await res.user.reload();

        if (!res.user.emailVerified) {
          setPortalOpen(false);
          return setError("Please verify your email first");
        }

        const token = await res.user.getIdToken(true);
        const backendRes = await publicApi.post("/auth/login", { token });

        localStorage.setItem("token", backendRes.data.token);
        navigate("/");
      } catch {
        setPortalOpen(false);
        setError("Login failed");
      }
    }, 1800);
  };

  /* 🔁 FORGOT PASSWORD */
  const handleForgotPassword = async () => {
    if (!forgotEmail) return setError("Enter registered email");

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setError("Password reset email sent");
      setForgotMode(false);
    } catch {
      setError("Password reset failed");
    }
  };

  /* 🧛 REGISTER */
  const handleRegister = async () => {
    if (!regEmail || !regPassword) {
      return setError("Enter email and password");
    }

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        regEmail,
        regPassword
      );

      await sendEmailVerification(res.user);

      const token = await res.user.getIdToken(true);
      await publicApi.post("/auth/login", { email: regEmail, token });

      setError("Verification email sent. Verify before login.");
      setMode("login");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <>
      <div className="scene-root" data-theme={theme}>

        {/* 🎃 LOADER */}
        {portalOpen && (
          <div className="pumpkin-loader">
            <div className="pumpkin">
              <div className="stem"></div>
              <div className="rib r1"></div>
              <div className="rib r2"></div>
              <div className="rib r3"></div>
              <div className="rib r4"></div>
              <div className="face">
                <div className="eye left"></div>
                <div className="eye right"></div>
                <div className="nose"></div>
                <div className="mouth">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPTIONAL AUDIO */}
        <audio id="thunder" src="/sounds/thunder.mp3" />
        <audio id="whisper" src="/sounds/whisper.mp3" />

        {/* 🩸 CARD */}
        <MDBContainer className="horror-card">

          {/* 🌗 THEME TOGGLE */}
          <button
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              marginBottom: "12px"
            }}
          >
            {theme === "light" ? "🌗 Dark Mode" : "🌕 Light Mode"}
          </button>

          <h1 className="title-main">WELCOME TO</h1>
          <h1 className="title-glow">VOTING WORLD</h1>
          <p className="creator">Developed by Meet Virugama</p>

          {/* ENTRY */}
          {mode === null && (
            <>
              <MDBBtn className="btn-dark" onClick={() => setMode("login")}>
                Enter
              </MDBBtn>
              <MDBBtn className="btn-dark alt" onClick={() => setMode("register")}>
                Register
              </MDBBtn>
            </>
          )}

          {/* LOGIN */}
          {mode === "login" && !forgotMode && (
            <>
              <MDBInput label="Email" onChange={e => setLoginEmail(e.target.value)} />
              <MDBInput label="Password" type="password" onChange={e => setLoginPassword(e.target.value)} />
              <MDBBtn className="btn-dark" onClick={handleLogin}>
                Open Portal
              </MDBBtn>
              <p className="forgot-link" onClick={() => setForgotMode(true)}>
                Forgot Password?
              </p>
            </>
          )}

          {/* FORGOT */}
          {mode === "login" && forgotMode && (
            <>
              <MDBInput label="Registered Email" onChange={e => setForgotEmail(e.target.value)} />
              <MDBBtn className="btn-dark alt" onClick={handleForgotPassword}>
                Send Reset Spell
              </MDBBtn>
              <p className="forgot-link" onClick={() => setForgotMode(false)}>
                ← Back
              </p>
            </>
          )}

          {/* REGISTER */}
          {mode === "register" && (
            <>
              <MDBInput label="Email" onChange={e => setRegEmail(e.target.value)} />
              <MDBInput label="Password" type="password" onChange={e => setRegPassword(e.target.value)} />
              <MDBCheckbox label="I swear to vote honestly" />
              <MDBBtn className="btn-dark alt" onClick={handleRegister}>
                Bind My Vote
              </MDBBtn>
            </>
          )}
        </MDBContainer>
      </div>

      {/* 🔥 GLOBAL ERROR POPUP */}
      <ErrorPopup message={error} onClose={() => setError("")} />
    </>
  );
}
