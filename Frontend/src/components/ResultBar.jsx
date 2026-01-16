import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../public/resultBar.css";

export default function ResultBar({
  greenVotes,
  purpleVotes,
  greenName,
  purpleName
}) {
  const { user } = useContext(AuthContext);

  const total = greenVotes + purpleVotes;

  const greenTarget = total ? (greenVotes / total) * 100 : 0;
  const purpleTarget = 100 - greenTarget;

  const [animate, setAnimate] = useState(false);
  const [greenCount, setGreenCount] = useState(0);
  const [purpleCount, setPurpleCount] = useState(0);

  const greenWinner = greenTarget > purpleTarget;

  useEffect(() => {
    setAnimate(false);
    setGreenCount(0);
    setPurpleCount(0);
    setTimeout(() => setAnimate(true), 100);
  }, [greenVotes, purpleVotes]);

  useEffect(() => {
    if (!animate) return;

    let g = 0;
    let p = 0;

    const interval = setInterval(() => {
      g += 1;
      p += 1;

      if (g <= greenTarget) setGreenCount(g);
      if (p <= purpleTarget) setPurpleCount(p);

      if (g >= greenTarget && p >= purpleTarget) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [animate, greenTarget, purpleTarget]);

  return (
    <div className="result-container theme-black-gold">
      <div className="percentage-bar">
        <div
          className={`green-part ${animate ? "animate" : ""} ${
            greenWinner ? "winner" : ""
          }`}
          style={{ "--target": `${greenTarget}%` }}
        />
        <div
          className={`purple-part ${animate ? "animate" : ""} ${
            !greenWinner ? "winner" : ""
          }`}
          style={{ "--target": `${purpleTarget}%` }}
        />
      </div>

      <div className="numbers">
        <span className="green-text">🟢 {greenCount.toFixed(0)}%</span>
        <span className="purple-text">🟣 {purpleCount.toFixed(0)}%</span>
      </div>

      <div className="winner-text">
        {greenWinner
          ? `🎃 ${greenName} WINS 🏆`
          : `🎃 ${purpleName} WINS 🏆`}
      </div>

      <div className="loser-text">
        ☠️ {greenWinner ? purpleName : greenName} LOST
      </div>

      {/* 🔐 ADMIN ONLY */}
      {user?.role === "admin" && (
        <div className="admin-votes">
          <div>🟢 {greenName}: <b>{greenVotes}</b> votes</div>
          <div>🟣 {purpleName}: <b>{purpleVotes}</b> votes</div>
          <div className="total-votes">
            🧮 Total Votes: <b>{total}</b>
          </div>
        </div>
      )}
    </div>
  );
}
