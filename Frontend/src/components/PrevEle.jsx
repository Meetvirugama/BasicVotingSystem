import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import "../public/prevEle.css";
import Navbar from "./Navbar";
import ActionBar from "./ActionBar";
import ResultBar from "./ResultBar";
import { AuthContext } from "../context/AuthContext";
import ErrorPopup from "./ErrorPopup";

export default function PreviousElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("DEFAULT");
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext); // admin | voter

  /* ===========================
     LOAD PREVIOUS ELECTIONS
  ============================ */
  useEffect(() => {
    const loadElections = async () => {
      try {
        const res = await api.get("/election");

        const now = new Date();

        // PREVIOUS = closed OR time passed
        const previous = res.data.filter(
          (e) =>
            e.status === "closed" ||
            new Date(e.end_date) < now
        );

        setElections(previous);
      } catch (err) {
        console.error("LOAD PREVIOUS ERROR:", err);
        setError("Unable to load previous elections");
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
        e.TeamA?.toLowerCase().includes(q) ||
        e.TeamB?.toLowerCase().includes(q) ||
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
     LOADING
  ============================ */
  if (loading) {
    return <div className="loading">Loading previous elections…</div>;
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
        <h2 className="page-title">🏁 Previous Elections</h2>

        {sorted.length === 0 ? (
          <p className="empty">No previous elections</p>
        ) : (
          <div className="election-grid">
            {sorted.map((e) => {
              const canSeeResult =
                user?.role === "admin" || e.result_declared === true;

              const winner =
                e.CA > e.CB ? e.TeamA :
                e.CB > e.CA ? e.TeamB :
                "Tie";

              return (
                <div className="election-card" key={e.id}>
                  <h3 className="election-title">{e.title}</h3>

                  <p className="election-desc">{e.description}</p>

                  <div className="date-row">
                    <span>
                      📅 Start:{" "}
                      {new Date(e.start_date).toLocaleDateString("en-IN")}
                    </span>
                    <span>
                      🏁 End:{" "}
                      {new Date(e.end_date).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {e.tags?.length > 0 && (
                    <div className="tag-row">
                      {e.tags.map((tag, i) => (
                        <span key={i} className="tag-chip">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* RESULT VISIBILITY */}
                  <div className="vote-stat">
                    <ResultBar greenVotes={e.CA} purpleVotes={e.CB} greenName={e.TeamA} purpleName={e.TeamB}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
