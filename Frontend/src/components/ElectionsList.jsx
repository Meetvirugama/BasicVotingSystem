import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import "../public/elections.css";
import ActionBar from "./ActionBar";
import { AuthContext } from "../context/AuthContext";
import ErrorPopup from "./ErrorPopup";

export default function ElectionsList() {
  const [elections, setElections] = useState([]);
  const [voted, setVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("DEFAULT");
  const [error, setError] = useState("");

  const { user } = useContext(AuthContext);

  /* ===========================
     LOAD LIVE ELECTIONS
  ============================ */
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

  /* ===========================
     LOAD USER VOTES
  ============================ */
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

  /* ===========================
     CAST VOTE
  ============================ */
  const vote = async (id, team) => {
    try {
      await api.post("/vote", { election_id: id, team });
      await Promise.all([loadElections(), loadUserVotes()]);
    } catch {
      setError("Vote failed");
    }
  };

  /* ===========================
     FILTER (title + desc + tags)
  ============================ */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return elections.filter((e) =>
      e.title?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.tags?.some((tag) => tag.toLowerCase().includes(q))
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

  switch (type) {
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
}, [filtered, type]);


  if (loading || !user) {
    return <div className="loading">Summoning votes…</div>;
  }

  return (
    <>
      <ActionBar search={search} setSearch={setSearch} setSort={setType} />

      <div className="elections-page">
        <h2 className="page-title">🎃 Live Elections</h2>

        <div className="election-grid">
          {sorted.map((e) => {
            const hasVoted = voted.includes(e.id);
            const totalVotes = (e.CA || 0) + (e.CB || 0);

            return (
              <div className="election-card" key={e.id}>
                <h3 className="election-title">{e.title}</h3>
                <p className="election-desc">{e.description}</p>

                {/* TAGS */}
                {e.tags?.length > 0 && (
                  <div className="tag-row">
                    {e.tags.map((tag, i) => (
                      <span className="tag-chip" key={i}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* DATES */}
                <div className="date-row">
                  <span>
                    🗓 {new Date(e.start_date).toLocaleDateString("en-IN")}
                  </span>
                  <span>
                    ⏳ {new Date(e.end_date).toLocaleDateString("en-IN")}
                  </span>
                </div>

                {/* VOTES */}
                {user?.role === "admin" && (
                  <div className="vote-board">
                    <div>
                      <div className="vote-box">{e.CA}</div>
                      <div className="vote-label">{e.TeamA}</div>
                      </div> 
                    <div>
                      <div className="vote-box">{e.CB}</div>
                      <div className="vote-label">{e.TeamB}</div>
                    </div>
                    <div>
                      <div className="vote-box">{totalVotes}</div>
                      <div className="vote-label">TOTAL</div>
                    </div>
                  </div>
                )}
                  

                {/* VOTING */}
                <div className="team-buttons">
                  <button
                    className="vote-btn team-a"
                    disabled={hasVoted}
                    onClick={() => vote(e.id, "A")}
                  >
                    {hasVoted ? "VOTED" : e.TeamA}
                  </button>

                  <button
                    className="vote-btn team-b"
                    disabled={hasVoted}
                    onClick={() => vote(e.id, "B")}
                  >
                    {hasVoted ? "VOTED" : e.TeamB}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ErrorPopup message={error} onClose={() => setError("")}/>
    </>
  );
}
