import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ErrorPopup from "./ErrorPopup";
import "../public/editelection.css";

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
      } catch (err) {
        setError("Election not found or you don't have access");
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, [id]);

  /* ===========================
     SAVE UPDATE
  ============================ */
  const save = async () => {
    try {
      await api.put(`/election/${id}`, {
        ...form,
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

  /* ===========================
     LOADING
  ============================ */
  if (loading) {
    return <div className="loading">Loading election…</div>;
  }

  /* ===========================
     UI
  ============================ */
  return (
    <>
      <div className="edit-page">
        <h2>✏️ Edit Election</h2>

        <input
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          placeholder="Election Title"
        />

        <textarea
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="Election Description"
        />

        <input
          type="date"
          value={form.start_date}
          onChange={(e) =>
            setForm({ ...form, start_date: e.target.value })
          }
        />

        <input
          type="date"
          value={form.end_date}
          onChange={(e) =>
            setForm({ ...form, end_date: e.target.value })
          }
        />

        <input
          value={form.tags}
          onChange={(e) =>
            setForm({ ...form, tags: e.target.value })
          }
          placeholder="tags (comma separated)"
        />

        <button onClick={save}>💾 Save Changes</button>
      </div>

      {/* 🔥 Error Popup */}
      <ErrorPopup
        message={error}
        onClose={() => {
          setError("");
          if (error.includes("not found")) {
            navigate("/upcoming");
          }
        }}
      />
    </>
  );
}
