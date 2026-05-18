import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import "../public/elections.css";
import { AuthContext } from "../context/AuthContext";
import ErrorPopup from "./ErrorPopup";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card animate-slide">
        <div className="modal-icon success"><i className="fas fa-check-circle"></i></div>
        <h3>Vote Confirmed</h3>
        <p>Your selection has been securely recorded and verified in the system.</p>
        <div className="receipt-box">
          <label>OFFICIAL RECEIPT HASH</label>
          <code>{receipt.receipt}</code>
        </div>
        <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Dismiss</button>
      </div>
    </div>
  );
};

export default function UpcomingElections() {
  const [elections, setElections] = useState([]);
  const [voted, setVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const init = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    init();
  }, []);

  const loadData = async () => {
    try {
      const [eleRes, voteRes] = await Promise.all([api.get("/election"), api.get("/vote/my")]);
      const now = new Date();
      setElections(eleRes.data.filter(e => e.status === "active" && new Date(e.start_date) <= now && new Date(e.end_date) >= now));
      setVoted(voteRes.data.map(v => v.election_id));
    } catch {
      setError("System unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleVote = async (id, candidateId) => {
    try {
      const res = await api.post("/vote", { election_id: id, candidate_id: candidateId, fingerprint });
      setSuccessReceipt(res.data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to process vote.");
    }
  };

  if (loading) return <div className="loading">Authenticating Session...</div>;

  return (
    <div className="elections-container">
      <div className="section-header">
        <h2>Live Voting Portal</h2>
        <p>Participate in active secure elections. Your identity is verified and anonymous.</p>
      </div>

      <div className="election-list">
        {elections.map((e) => {
          const hasVoted = voted.includes(e.id);
          const total = e.candidates.reduce((a, b) => a + b.votes, 0);

          return (
            <div className="election-row-card glass-card" key={e.id}>
              <div className="row-main">
                <div className="row-info">
                  <h3 className="row-title">{e.title}</h3>
                  <p className="row-desc">{e.description}</p>
                  <div className="row-meta">
                    <span><i className="fas fa-users"></i> {total} Total Votes</span>
                    <span><i className="fas fa-clock"></i> Ends {new Date(e.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="candidate-grid">
                  {e.candidates.map(c => (
                    <button 
                      key={c.id} 
                      className={`candidate-btn ${hasVoted ? 'disabled' : ''}`}
                      onClick={() => !hasVoted && handleVote(e.id, c.id)}
                    >
                      <span className="c-name">{c.name}</span>
                      {hasVoted ? <i className="fas fa-check-circle"></i> : <i className="fas fa-plus"></i>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {elections.length === 0 && (
          <div className="empty-state">
             <i className="fas fa-inbox"></i>
             <h3>No active sessions</h3>
             <p>All voting sessions are currently concluded or upcoming.</p>
          </div>
        )}
      </div>

      <ReceiptModal receipt={successReceipt} onClose={() => setSuccessReceipt(null)} />
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </div>
  );
}
