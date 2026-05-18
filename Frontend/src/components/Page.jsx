import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "react-router-dom";
import "../public/dashboard.css";

const StatCard = ({ label, value, icon, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: color }}>
      <i className={icon}></i>
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

export default function Page() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ active: 0, closed: 0, votes: 0 });
  const [recentElections, setRecentElections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [electionsRes, votesRes] = await Promise.all([
          api.get("/election"),
          api.get("/vote/my")
        ]);
        
        const active = electionsRes.data.filter(e => e.status === "active").length;
        const closed = electionsRes.data.filter(e => e.status === "closed").length;
        
        setStats({
          active,
          closed,
          votes: votesRes.data.length
        });

        setRecentElections(electionsRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard data load failed");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* 🚀 WELCOME BANNER */}
      <div className="welcome-banner">
        <div className="banner-text">
          <h2>Good Morning, {user?.name.split(' ')[0]}!</h2>
          <p>Welcome back to the high-level secure voting hub. All systems are operational.</p>
          <Link to="/upcoming" className="banner-btn">Explore Active Polls</Link>
        </div>
        <div className="banner-img">
          <i className="fas fa-rocket"></i>
        </div>
      </div>

      {/* 📊 QUICK STATS */}
      <div className="stats-grid">
        <StatCard label="Active Polls" value={stats.active} icon="fas fa-vote-yea" color="#7c3aed" />
        <StatCard label="Archived Polls" value={stats.closed} icon="fas fa-archive" color="#3b82f6" />
        <StatCard label="My Participation" value={stats.votes} icon="fas fa-check-double" color="#10b981" />
        <StatCard label="System Trust" value="100%" icon="fas fa-shield-alt" color="#f59e0b" />
      </div>

      <div className="dashboard-grid">
        {/* 🗳️ RECENT ELECTIONS PREVIEW */}
        <div className="dashboard-card main">
          <div className="card-header">
            <h3>Recent Voting Sessions</h3>
            <Link to="/upcoming">View All</Link>
          </div>
          <div className="election-mini-list">
            {recentElections.map(e => (
              <div key={e.id} className="election-mini-item">
                <div className="item-info">
                  <p className="item-title">{e.title}</p>
                  <p className="item-desc">{e.description.substring(0, 60)}...</p>
                </div>
                <div className={`item-status ${e.status}`}>{e.status.toUpperCase()}</div>
                <Link to={e.status === 'active' ? '/upcoming' : '/results'} className="item-action">
                  <i className="fas fa-chevron-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 👤 PROFILE MINI CARD */}
        <div className="dashboard-card side">
          <div className="card-header">
            <h3>Identity Overview</h3>
          </div>
          <div className="profile-summary">
            <div className="summary-avatar">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h4 className="summary-name">{user?.name}</h4>
            <p className="summary-email">{user?.email}</p>
            <div className="summary-badge">{user?.role.toUpperCase()}</div>
            <Link to="/profile" className="summary-link">Manage Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
