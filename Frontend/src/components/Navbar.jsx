import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import "../public/navbar.css";

import profileImg from "../assets/voter.png";
import pumpkinImg from "../assets/house.png";

export default function Navbar() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  /* ===========================
     LOAD USER PROFILE
  ============================ */
  useEffect(() => {
    api
      .get("/user/profile")
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => {
        // silent redirect (no alert spam)
        window.location.href = "/verify";
      });
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <div className="navbar-logo">
          <img src={pumpkinImg} alt="Pumpkin" />
          <h2 className="logo">ELECTION</h2>
        </div>

        {/* NAV LINKS */}
        <ul className="navbar-links">
          {[
            { path: "/", label: "Home" },
            { path: "/upcoming", label: "Upcoming" },
            { path: "/results", label: "Results" }
          ].map((link) => (
            <li
              key={link.path}
              className={`nav-item ${
                location.pathname === link.path ? "active" : ""
              }`}
            >
              <Link className="nav-link" to={link.path}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* USER PROFILE */}
        <div className="navbar-right">
          {profile && (
            <span className="navbar-username">
              {profile.role === "admin" ? "ADMIN" : "VOTER"}
            </span>
          )}

          <Link to="/profile">
            <img
              src={profileImg}
              alt="profile"
              className="navbar-profile-img"
            />
          </Link>
        </div>

      </div>
    </nav>
  );
}
