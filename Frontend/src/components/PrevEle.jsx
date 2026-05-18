import { useEffect, useState } from "react";
import api from "../services/api";
import "../public/prevEle.css";
import ResultBar from "./ResultBar";
import ErrorPopup from "./ErrorPopup";

export default function ResultsHub() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/election");
        const now = new Date();
        setElections(res.data.filter(e => e.status === "closed" || new Date(e.end_date) < now));
      } catch {
        setError("History synchronization failed.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading">Syncing Global Archives...</div>;

  return (
    <div className="results-container">
      <div className="section-header">
        <h2>Certified Election Archives</h2>
        <p>Verified historical results with absolute data integrity and cryptographic proof.</p>
      </div>

      <div className="results-list">
        {elections.map((e) => {
          const total = e.candidates.reduce((a, b) => a + b.votes, 0);
          return (
            <div className="result-row-card glass-card animate-slide" key={e.id}>
              <div className="result-main">
                <div className="result-info">
                  <div className="certified-badge">
                     <i className="fas fa-certificate"></i> CERTIFIED
                  </div>
                  <h3 className="row-title">{e.title}</h3>
                  <p className="row-desc">{e.description}</p>
                  
                  <div className="results-meta">
                    <div className="m-item">
                       <label>TOTAL PARTICIPATION</label>
                       <b>{total} Votes Recorded</b>
                    </div>
                    <div className="m-item">
                       <label>CONCLUSION DATE</label>
                       <b>{new Date(e.end_date).toLocaleDateString()}</b>
                    </div>
                  </div>
                </div>

                <div className="viz-section">
                   <ResultBar candidates={e.candidates} />
                </div>
              </div>
            </div>
          );
        })}

        {elections.length === 0 && (
          <div className="empty-state">
             <i className="fas fa-history"></i>
             <h3>Archive is empty</h3>
             <p>No elections have been concluded on this network yet.</p>
          </div>
        )}
      </div>

      <ErrorPopup message={error} onClose={() => setError("")}/>
    </div>
  );
}
