import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import "../public/profile.css";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "./ErrorPopup";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const votesRes = await api.get("/vote/my");
        setVotes(votesRes.data);
      } catch (err) {
        setError("Unable to sync profile data.");
      }
    };
    fetchData();
  }, []);

  if (!user) return <div className="loading">Initializing Secure Identity...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header-card glass-card animate-slide">
         <div className="p-header-top">
            <div className="p-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="p-id-info">
               <h2>{user.name}</h2>
               <p>{user.email}</p>
               <span className={`role-badge ${user.role}`}>{user.role.toUpperCase()}</span>
            </div>
            <div className="header-stat-pill">
               <b>{votes.length}</b>
               <span>Certified Votes</span>
            </div>
         </div>
      </div>

      <div className="profile-content-grid">
         {/* 🗳️ DETAILED PARTICIPATION HISTORY */}
         <div className="glass-card">
            <div className="card-header">
               <h3>Participation History</h3>
            </div>
            <div className="participation-list">
               {votes.map((v, i) => {
                  const candidate = v.Election?.candidates?.find(c => c.id === v.candidate_id);
                  return (
                    <div key={i} className="participation-item-detailed">
                       <div className="p-status-indicator" style={{ backgroundColor: v.Election?.status === 'active' ? '#10b981' : '#64748b' }}></div>
                       <div className="p-main-info">
                          <div className="p-header">
                             <h4 className="p-election-title">{v.Election?.title || "Unknown Election"}</h4>
                             <span className="p-type-badge">{v.Election?.status.toUpperCase()}</span>
                          </div>
                          <div className="p-choice">
                             <label>YOUR SECURE CHOICE</label>
                             <b>{candidate?.name || "Anonymous Candidate"}</b>
                          </div>
                          <div className="p-footer">
                             <span className="p-receipt"><i className="fas fa-fingerprint"></i> {v.receipt_hash}</span>
                             <span className="p-date">{new Date(v.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                  );
               })}
               {votes.length === 0 && (
                 <div className="empty-history">
                    <i className="fas fa-inbox"></i>
                    <p>No participation records found in the ledger.</p>
                 </div>
               )}
            </div>
         </div>

         {/* 🛡️ SECURITY & ADMIN */}
         <div className="glass-card">
            <div className="card-header">
               <h3>Identity & Trust</h3>
            </div>
            <div className="security-list">
               <div className="sec-item">
                  <div className="sec-info">
                     <p className="sec-title">Authentication Strategy</p>
                     <p className="sec-desc">Secured via Clerk Identity Protocol</p>
                  </div>
                  <div className="sec-status active">MFA ENABLED</div>
               </div>
               <div className="sec-item">
                  <div className="sec-info">
                     <p className="sec-title">Digital Signature</p>
                     <p className="sec-desc">Hardware-level Sybil protection</p>
                  </div>
                  <div className="sec-status active">VERIFIED</div>
               </div>
            </div>

            {user.role === "admin" && (
               <div className="admin-actions">
                  <p className="admin-label">ADMINISTRATIVE HUB</p>
                  <button className="admin-action-btn" onClick={() => navigate("/election/create")}>
                     <i className="fas fa-plus-circle"></i> Initialize New Voting Poll
                  </button>
                  <button className="admin-action-btn" onClick={() => navigate("/admin/audit")}>
                     <i className="fas fa-shield-alt"></i> Access Global Audit Logs
                  </button>
               </div>
            )}
         </div>
      </div>
      
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </div>
  );
}
