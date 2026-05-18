import { useEffect, useState } from "react";
import api from "../services/api";
import "../public/adminAudit.css";

const AuditRow = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create_election': return '#10b981';
      case 'close_poll': return '#ef4444';
      case 'update_election': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div className="audit-row-item animate-slide">
      <div className="row-indicator" style={{ backgroundColor: getActionColor(log.action) }}></div>
      <div className="row-main-content">
        <div className="admin-pill">
           <div className="a-avatar-small">{log.admin_id.substring(0, 2).toUpperCase()}</div>
           <span className="a-id">{log.admin_id}</span>
        </div>
        
        <div className="action-info">
           <span className="action-text">{log.action.replace('_', ' ')}</span>
           <span className="target-text">Target: {log.election_id || "GLOBAL_SYSTEM"}</span>
        </div>

        <div className="time-info">
           <i className="far fa-clock"></i>
           <span>{new Date(log.createdAt).toLocaleString()}</span>
        </div>

        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
           <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </button>
      </div>

      {expanded && (
        <div className="row-details">
           <label>TRANSACTION METADATA</label>
           <pre>{JSON.stringify(log.details, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/admin/audit");
        setLogs(res.data);
      } catch (err) {
        console.error("Audit log sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="loading">Decrypting Secure Audit Trail...</div>;

  return (
    <div className="audit-page-container">
      <div className="section-header">
        <div className="header-badge">
           <i className="fas fa-shield-check"></i> IMMUTABLE LOGS
        </div>
        <h2>System Audit & Oversight</h2>
        <p>A cryptographically linked trail of every administrative interaction on the network.</p>
      </div>

      <div className="audit-list">
        {logs.length > 0 ? (
          logs.map((log) => <AuditRow key={log.id} log={log} />)
        ) : (
          <div className="audit-empty-card glass-card">
             <div className="empty-visual">
                <i className="fas fa-fingerprint"></i>
             </div>
             <h3>Zero Security Events</h3>
             <p>No administrative actions have been recorded on this ledger yet. The system state is pristine.</p>
          </div>
        )}
      </div>
    </div>
  );
}
