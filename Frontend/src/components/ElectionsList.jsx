import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import "../public/elections.css";
import ActionBar from "./ActionBar";
import { AuthContext } from "../context/AuthContext";
import ErrorPopup from "./ErrorPopup";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

/* ===========================
   RECEIPT MODAL COMPONENT
============================ */
const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  return (
    <div className="error-overlay" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
      <div className="auth-card" style={{ maxWidth: '400px', padding: '32px' }}>
        <div style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '16px' }}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Vote Confirmed</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Your selection has been securely recorded and verified.
        </p>
        
        <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <span style={{ fontSize: '0.625rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textAlign: 'left' }}>
            OFFICIAL RECEIPT HASH
          </span>
          <code style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '700', wordBreak: 'break-all' }}>
            {receipt.receipt}
          </code>
        </div>

        <button className="btn-dark" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

export default function ElectionsList() {
  const [elections, setElections] = useState([]);
  const [voted, setVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("DEFAULT");
  const [error, setError] = useState("");
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    setFp();
  }, []);

  const loadElections = async () => {
    try {
      const res = await api.get("/election");
      const today = new Date();
      setElections(
        res.data.filter(
          (e) =>
            e.status === "active" &&
            new Date(e.start_date) <= today &&
            new Date(e.end_date) >= today
        )
      );
    } catch {
      setElections([]);
    }
  };

  const loadUserVotes = async () => {
    try {
      const res = await api.get("/vote/my");
      setVoted(res.data.map((v) => v.election_id));
    } catch {
      setVoted([]);
    }
  };

  useEffect(() => {
    Promise.all([loadElections(), loadUserVotes()]).then(() =>
      setLoading(false)
    );
  }, []);

  const vote = async (id, candidateId) => {
    try {
      const res = await api.post("/vote", { 
        election_id: id, 
        candidate_id: candidateId,
        fingerprint 
      });
      
      setSuccessReceipt(res.data);
      await Promise.all([loadElections(), loadUserVotes()]);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to process your vote. Please try again.");
    }
  };

  const closePoll = async (id) => {
    if (!window.confirm("Are you sure you want to manually conclude this voting session?")) return;
    try {
      await api.put(`/election/${id}/close`);
      await loadElections();
    } catch {
      setError("Unable to close the poll session.");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return elections.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [elections, search]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    const totalVotes = (x) => (x.candidates || []).reduce((acc, curr) => acc + (curr.votes || 0), 0);
    const end = (x) => new Date(x.end_date).getTime();

    switch (type) {
      case "TITLE_ASC": data.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "TITLE_DESC": data.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "POPULAR_DESC": data.sort((a, b) => totalVotes(b) - totalVotes(a)); break;
      case "END_ASC": data.sort((a, b) => end(a) - end(b)); break;
      default: break;
    }
    return data;
  }, [filtered, type]);

  if (loading || !user) {
    return <div className="loading">Initialising secure voting session...</div>;
  }

  return (
    <>
      <ActionBar search={search} setSearch={setSearch} setSort={setType} />

      <div className="elections-page">
        <h2 className="page-title">Active Voting Sessions</h2>

        <div className="election-grid">
          {sorted.map((e) => {
            const hasVoted = voted.includes(e.id);
            const total = (e.candidates || []).reduce((acc, curr) => acc + (curr.votes || 0), 0);

            return (
              <div className="election-card" key={e.id}>
                <h3 className="election-title">{e.title}</h3>
                <p className="election-desc">{e.description}</p>

                {e.tags?.length > 0 && (
                  <div className="tag-row">
                    {e.tags.map((tag, i) => (
                      <span className="tag-chip" key={i}>{tag}</span>
                    ))}
                  </div>
                )}

                <div className="date-row">
                  <span><i className="fas fa-calendar-alt"></i> {new Date(e.start_date).toLocaleDateString()}</span>
                  <span><i className="fas fa-clock"></i> {new Date(e.end_date).toLocaleDateString()}</span>
                </div>

                {/* ADMIN ANALYTICS BOARD */}
                {user?.role === "admin" && (
                  <div className="vote-board" style={{ position: 'relative', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>LIVE ANALYTICS</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>TOTAL: {total}</span>
                    </div>
                    {e.candidates.map(c => (
                       <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8125rem' }}>{c.name}</span>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>{c.votes}</span>
                       </div>
                    ))}
                    
                    <button 
                      onClick={() => closePoll(e.id)}
                      style={{ 
                        position: 'absolute', top: '-10px', right: '-10px', padding: '4px 8px', borderRadius: '4px', fontSize: '0.625rem', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700'
                      }}
                    >
                      CLOSE SESSION
                    </button>
                  </div>
                )}

                {/* DYNAMIC CANDIDATE BUTTONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {(e.candidates || []).map(c => (
                    <button 
                      key={c.id}
                      className="vote-btn" 
                      disabled={hasVoted} 
                      onClick={() => vote(e.id, c.id)}
                      style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{c.name}</span>
                      {hasVoted && <i className="fas fa-check-circle"></i>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '80px', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '12px' }}>
              <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}></i>
              No active voting sessions found.
            </div>
          )}
        </div>
      </div>

      <ReceiptModal 
        receipt={successReceipt} 
        onClose={() => setSuccessReceipt(null)} 
      />

      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
