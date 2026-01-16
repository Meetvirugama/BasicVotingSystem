import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../public/upcomingEle.css";
import Navbar from "./Navbar";
import ActionBar from "./ActionBar";
import ErrorPopup from "./ErrorPopup";
import Img from "../assets/haunted-house.png";
import { AuthContext } from "../context/AuthContext";

export default function UpcomingEle() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("DEFAULT");
  const [error , setError] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ===========================
     LOAD UPCOMING ELECTIONS
  ============================ */
  useEffect(() => {
    const loadElections = async () => {
      try {
        const res = await api.get("/election");
        const now = new Date();

        const upcoming = res.data.filter(
          (e) => e.status === "draft" || new Date(e.start_date) > now
        );

        setElections(upcoming);
      } catch (err) {
        setError("Unable to load upcoming elections");
      } finally {
        setLoading(false);
      }
    };

    loadElections();
  }, []);

  /* ===========================
     SEARCH
  ============================ */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return elections.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [elections, search]);

  /* ===========================
     SORT
  ============================ */
  const sorted = useMemo(() => {
  const data = [...filtered];

  const popularity = (x) => x.CA + x.CB;
  const start = (x) => new Date(x.start_date).getTime();
  const end = (x) => new Date(x.end_date).getTime();
  const duration = (x) => end(x) - start(x);

  switch (sortType) {
    case "TITLE_ASC":
      data.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case "TITLE_DESC":
      data.sort((a, b) => b.title.localeCompare(a.title));
      break;

    case "POPULAR_ASC":
      data.sort((a, b) => popularity(a) - popularity(b));
      break;

    case "POPULAR_DESC":
      data.sort((a, b) => popularity(b) - popularity(a));
      break;

    case "START_ASC":
      data.sort((a, b) => start(a) - start(b));
      break;

    case "START_DESC":
      data.sort((a, b) => start(b) - start(a));
      break;

    case "END_ASC":
      data.sort((a, b) => end(a) - end(b));
      break;

    case "END_DESC":
      data.sort((a, b) => end(b) - end(a));
      break;

    case "DURATION":
      data.sort((a, b) => duration(b) - duration(a));
      break;

    default:
      break;
  }

  return data;
}, [filtered, sortType]);
  /* ===========================
     ADMIN DELETE
  ============================ */
  const deleteElection = async (id) => {
    if (!window.confirm("Delete this upcoming election?")) return;

    try {
      await api.delete(`/election/${id}`);
      setElections((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Delete failed");
    }
  };

  /* ===========================
     LOADING
  ============================ */
  if (loading) {
    return <div className="loading">Loading upcoming elections…</div>;
  }

  /* ===========================
     UI
  ============================ */
  return (
    <>
      <Navbar />

      <ActionBar
        search={search}
        setSearch={setSearch}
        setSort={setSortType}
      />

      <div className="elections-page">
        <h2 className="page-title">
          <span className="title-with-img">
            <img src={Img} alt="Upcoming" className="title-img" />
            Upcoming Elections
          </span>
        </h2>

        {sorted.length === 0 ? (
          <div className="up-empty">No upcoming elections</div>
        ) : (
          <div className="election-grid">
            {sorted.map((e) => (
              <div className="election-card" key={e.id}>
                <h3>{e.title}</h3>
                <p>{e.description}</p>

                <div className="date-row">
                  <span>🚀 {new Date(e.start_date).toLocaleDateString("en-IN")}</span>
                  <span>⏳ {new Date(e.end_date).toLocaleDateString("en-IN")}</span>
                </div>

                {e.tags?.length > 0 && (
                  <div className="tag-row">
                    {e.tags.map((t, i) => (
                      <span key={i} className="tag-chip">#{t}</span>
                    ))}
                  </div>
                )}

                <div className="up-wait">🕒 Voting has not started yet</div>

                {user?.role === "admin" && (
                  <div className="admin-actions">
                    <button
                      className="admin-edit"
                      onClick={() =>
                        navigate(`/admin/election/edit/${e.id}`)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="admin-delete"
                      onClick={() => deleteElection(e.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
