import { useState, useContext } from "react";
import api from "../services/api";
import "../public/electionCreate.css";
import ErrorPopup from "./ErrorPopup";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

export default function ElectionCreate() {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    tags: ""
  });

  const [candidates, setCandidates] = useState([
    { id: uuidv4(), name: "", votes: 0 },
    { id: uuidv4(), name: "", votes: 0 }
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (candidates.some(c => !c.name.trim())) {
      return setError("All candidates must have a name.");
    }

    try {
      await api.post("/election", {
        ...form,
        candidates,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : []
      });

      setSuccess(true);
      setError("Success: Dynamic voting poll has been published.");
      setForm({ title: "", description: "", start_date: "", end_date: "", tags: "" });
      setCandidates([{ id: uuidv4(), name: "", votes: 0 }, { id: uuidv4(), name: "", votes: 0 }]);

      setTimeout(() => { window.location.href = "/"; }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish the new election poll.");
    }
  };

  return (
    <div className="create-election-container">
      <div className="section-header">
         <h2>Launch New Voting Session</h2>
         <p>Initialize a secure, multi-candidate poll on the network with custom parameters.</p>
      </div>

      <div className="glass-card create-card-main">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
             <label>SESSION TITLE</label>
             <input
              className="form-input"
              name="title"
              placeholder="e.g. 2026 Executive Board Election"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
             <label>SESSION DESCRIPTION</label>
             <textarea
              className="form-textarea"
              name="description"
              placeholder="Provide context and rules for this voting session..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* 👥 DYNAMIC CANDIDATES */}
          <div className="candidates-section">
            <label className="section-label">CANDIDATE CONFIGURATION</label>
            <div className="candidates-list">
              {candidates.map((c, index) => (
                <div key={c.id} className="candidate-input-row">
                   <div className="c-number">{index + 1}</div>
                   <input
                    className="form-input"
                    placeholder={`Candidate ${index + 1} Name`}
                    value={c.name}
                    onChange={(e) => handleCandidateChange(c.id, e.target.value)}
                    required
                  />
                  {candidates.length > 2 && (
                    <button 
                      type="button" 
                      className="remove-c-btn"
                      onClick={() => removeCandidate(c.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              type="button" 
              className="add-c-btn" 
              onClick={addCandidate}
            >
              <i className="fas fa-plus"></i> ADD CANDIDATE OPTION
            </button>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>START DATE</label>
              <input className="form-input" type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>END DATE</label>
              <input className="form-input" type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
             <label>TAGS (COMMA SEPARATED)</label>
             <input
              className="form-input"
              name="tags"
              placeholder="Finance, HR, Regional"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-footer">
             <button className="btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fas fa-rocket"></i> PUBLISH SECURE POLL
             </button>
          </div>
        </form>
      </div>

      <ErrorPopup message={error} onClose={() => setError("")}/>
    </div>
  );
}
