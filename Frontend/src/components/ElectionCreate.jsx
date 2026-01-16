import { useState, useContext } from "react";
import api from "../services/api";
import ActionBar from "./ActionBar";
import "../public/electionCreate.css";
import ErrorPopup from "./ErrorPopup";
import { AuthContext } from "../context/AuthContext";

export default function ElectionCreate() {
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    TeamA: "",
    TeamB: "",
    description: "",
    start_date: "",
    end_date: "",
    tags: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/election", {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim())
      });

      setError("🎃 Election created successfully!");
      setForm({
        title: "",
        TeamA: "",
        TeamB: "",
        description: "",
        start_date: "",
        end_date: "",
        tags: ""
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to create election");
    }
  };

  return (
    <>
      <ActionBar />

      <div className="create-election-page">
        <form className="create-election-card" onSubmit={handleSubmit}>
          <h2 className="create-election-title">🎃 Create New Election</h2>

          <div className="form-row">
            <input
              className="form-input full-width"
              name="title"
              placeholder="Election Title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              className="form-input half-width"
              name="TeamA"
              placeholder="Team A Name"
              value={form.TeamA}
              onChange={handleChange}
              required
            />
            <input
              className="form-input half-width"
              name="TeamB"
              placeholder="Team B Name"
              value={form.TeamB}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <textarea
              className="form-textarea full-width"
              name="description"
              placeholder="Election Description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-column">
              <label>Start Date</label>
              <input
                className="form-input"
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-column">
              <label>End Date</label>
              <input
                className="form-input"
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <input
              className="form-input full-width"
              name="tags"
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={handleChange}
            />
          </div>

          <button className="create-election-btn" type="submit">
            🎃 Create Election
          </button>
        </form>
      </div>

      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
