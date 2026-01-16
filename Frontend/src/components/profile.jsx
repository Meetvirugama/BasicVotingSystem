import { useEffect, useState } from "react";
import api from "../services/api";
import "../public/profile.css";
import Navbar from "./Navbar";
import ActionBar from "./ActionBar";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "./ErrorPopup";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    age: "",
  });

  /* ===========================
     LOAD PROFILE
  ============================ */
  useEffect(() => {
    api
      .get("/user/profile")
      .then((res) => {
        setProfile(res.data);
        setFormData({
          name: res.data.name || "",
          mobile: res.data.mobile || "",
          age: res.data.age || "",
        });
      })
      .catch(() => {
        setError("Session expired. Please login again.");
        window.location.href = "/verify";
      });
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ===========================
     SAVE PROFILE
  ============================ */
  const saveProfile = async () => {
    try {
      const res = await api.put("/user/profile", formData);
      setProfile(res.data);
      setEditMode(false);
    } catch {
      setError("Update failed");
    }
  };

  /* ===========================
     LOGOUT
  ============================ */
  const logout = async () => {
    await fetch("http://localhost:5001/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/verify";
  };

  if (!profile) return <h3 className="pumpkin-loading">Loading...</h3>;

  const isAdmin = profile.role === "admin";

  return (
    <>
      <Navbar />
      <ActionBar />

      <div className="pumpkin-card">
        <h2 className="pumpkin-title blood-text">
          PROFILE {isAdmin && <span className="admin-badge">ADMIN</span>}
        </h2>

        <div className="pumpkin-row">
          <span>Name</span>
          {editMode ? (
            <input
              className="pumpkin-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          ) : (
            <b>{profile.name}</b>
          )}
        </div>

        <div className="pumpkin-row">
          <span>Email</span>
          <b>{profile.email}</b>
        </div>

        <div className="pumpkin-row">
          <span>Mobile</span>
          {editMode ? (
            <input
              className="pumpkin-input"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          ) : (
            <b>{profile.mobile || "-"}</b>
          )}
        </div>

        <div className="pumpkin-row">
          <span>Age</span>
          {editMode ? (
            <input
              className="pumpkin-input"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          ) : (
            <b>{profile.age || "-"}</b>
          )}
        </div>

        <div className="pumpkin-row">
          <span>Role</span>
          <b>{profile.role}</b>
        </div>

        {/* ===========================
           ADMIN PANEL
        ============================ */}
        {isAdmin && (
          <div className="admin-panel">
            <h3 className="admin-title">👑 Admin Controls</h3>

            <button
              className="admin-btn"
              onClick={() => navigate("/election/create")}
            >
              ➕ Create Election
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/admin/elections")}
            >
              🗳 Manage Elections
            </button>

            <button
              className="admin-btn"
              onClick={() => navigate("/results")}
            >
              📊 Declare / View Results
            </button>
          </div>
        )}

        {/* ===========================
           ACTIONS
        ============================ */}
        <div className="pumpkin-actions">
          {editMode ? (
            <>
              <button className="pumpkin-save" onClick={saveProfile}>
                SAVE
              </button>
              <button
                className="pumpkin-cancel"
                onClick={() => setEditMode(false)}
              >
                CANCEL
              </button>
            </>
          ) : (
            <>
              <button
                className="pumpkin-edit blood-text"
                onClick={() => setEditMode(true)}
              >
                EDIT
              </button>

              <button
                className="pumpkin-logout blood-text"
                onClick={logout}
              >
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
