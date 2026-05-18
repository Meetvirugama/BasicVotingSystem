import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ErrorPopup from "./ErrorPopup";
import "../public/editelection.css";
import { v4 as uuidv4 } from 'uuid';

export default function EditElection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    tags: ""
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===========================
     LOAD ELECTION
  ============================ */
  useEffect(() => {
    const loadElection = async () => {
      try {
        const res = await api.get(`/election/${id}`);
        const e = res.data;

        setForm({
          title: e.title || "",
          description: e.description || "",
          start_date: e.start_date?.slice(0, 10) || "",
          end_date: e.end_date?.slice(0, 10) || "",
          tags: e.tags?.join(", ") || ""
        });
        setCandidates(e.candidates || []);
      } catch (err) {
        setError("Election not found or you don't have access");
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, [id]);

  /* ===========================
     CANDIDATE HELPERS
  ============================ */
  const handleCandidateChange = (id, name) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const addCandidate = () => {
    setCandidates([...candidates, { id: uuidv4(), name: "", votes: 0 }]);
  };

  const removeCandidate = (id) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter(c => c.id !== id));
  };

  /* ===========================
     SAVE UPDATE
  ============================ */
  const save = async () => {
    if (candidates.some(c => !c.name.trim())) {
      return setError("All candidates must have a name.");
    }

    try {
      await api.put(`/election/${id}`, {
        ...form,
        candidates,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      });

      navigate("/upcoming");
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    }
  };

  if (loading) return <div className="loading">Retrieving poll configuration…</div>;

  return (
    <>
      <div className="edit-page">
        <h2>Update Voting Poll</h2>

        <label className="form-label">Poll Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Poll Title"
        />

        <label className="form-label">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Poll Description"
        />

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Start Date</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">End Date</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>

        {/* CANDIDATES EDIT */}
        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <label className="form-label">Candidates / Options</label>
          {candidates.map((c, index) => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
               <input
                style={{ marginBottom: '0' }}
                placeholder={`Candidate ${index + 1}`}
                value={c.name}
                onChange={(e) => handleCandidateChange(c.id, e.target.value)}
              />
              {candidates.length > 2 && (
                <button 
                  onClick={() => removeCandidate(c.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          ))}
          <button onClick={addCandidate} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
             <i className="fas fa-plus"></i> Add Option
          </button>
        </div>

        <label className="form-label">Tags (comma separated)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="Category tags"
        />

        <button onClick={save} className="btn-primary" style={{ marginTop: '24px', width: '100%' }}>
          Update Secure Session
        </button>
      </div>

      <ErrorPopup message={error} onClose={() => {
        setError("");
        if (error.includes("not found")) navigate("/upcoming");
      }}/>
    </>
  );
}
