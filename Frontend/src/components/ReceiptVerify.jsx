import { useState } from "react";
import api from "../services/api";
import "../public/receiptVerify.css";

export default function ReceiptVerify() {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!hash.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // We'll add a new endpoint for this
      const res = await api.get(`/vote/verify/${hash}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Receipt not found in the secure ledger.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-hub-container">
      <div className="section-header">
         <div className="header-badge">
            <i className="fas fa-fingerprint"></i> LEDGER VERIFICATION
         </div>
         <h2>Cryptographic Proof Portal</h2>
         <p>Verify that your selection has been permanently and accurately recorded on the platform ledger.</p>
      </div>

      <div className="glass-card verify-search-card">
         <form className="verify-form" onSubmit={handleVerify}>
            <div className="v-input-group">
               <i className="fas fa-hashtag"></i>
               <input 
                 type="text" 
                 placeholder="Enter your 16-character receipt hash..." 
                 value={hash}
                 onChange={(e) => setHash(e.target.value)}
                 maxLength={16}
               />
               <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "SEARCHING..." : "VERIFY NOW"}
               </button>
            </div>
         </form>

         {error && (
            <div className="verify-error animate-slide">
               <i className="fas fa-exclamation-triangle"></i>
               <span>{error}</span>
            </div>
         )}

         {result && (
            <div className="verify-result-card animate-slide">
               <div className="v-result-header">
                  <div className="v-icon-success"><i className="fas fa-shield-check"></i></div>
                  <div className="v-status-info">
                     <h3>Authenticity Confirmed</h3>
                     <p>Receipt matches a valid entry in the secure voting ledger.</p>
                  </div>
               </div>

               <div className="v-result-details">
                  <div className="d-item">
                     <label>VOTING SESSION</label>
                     <b>{result.election_title}</b>
                  </div>
                  <div className="d-item">
                     <label>RECORDED CHOICE</label>
                     <b className="primary-text">{result.candidate_name}</b>
                  </div>
                  <div className="d-item">
                     <label>CERTIFICATION DATE</label>
                     <b>{new Date(result.timestamp).toLocaleString()}</b>
                  </div>
               </div>

               <div className="v-result-footer">
                  <i className="fas fa-lock"></i>
                  <span>This record is immutable and cryptographically signed.</span>
               </div>
            </div>
         )}
      </div>

      <div className="verify-info-cards">
         <div className="info-mini-card">
            <i className="fas fa-database"></i>
            <h4>Decentralized Logic</h4>
            <p>Every vote creates a unique hash linked to the session and candidate.</p>
         </div>
         <div className="info-mini-card">
            <i className="fas fa-eye"></i>
            <h4>Public Transparency</h4>
            <p>Verification is available to all participants for absolute trust.</p>
         </div>
         <div className="info-mini-card">
            <i className="fas fa-user-secret"></i>
            <h4>Anonymity Maintained</h4>
            <p>Hashes do not expose user PII, only the certified selection.</p>
         </div>
      </div>
    </div>
  );
}
