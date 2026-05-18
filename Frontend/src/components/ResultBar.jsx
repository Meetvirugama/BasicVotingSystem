import "../public/resultBar.css";

export default function ResultBar({ candidates = [] }) {
  const total = candidates.reduce((acc, curr) => acc + (curr.votes || 0), 0);

  return (
    <div className="results-viz-container">
      {candidates.map((c, i) => {
        const percent = total > 0 ? Math.round((c.votes / total) * 100) : 0;
        
        return (
          <div key={c.id || i} className="viz-row">
            <div className="viz-info">
              <span className="viz-name">{c.name}</span>
              <span className="viz-count">{c.votes} Votes ({percent}%)</span>
            </div>
            <div className="viz-bar-track">
              <div 
                className="viz-bar-fill" 
                style={{ 
                  width: `${percent}%`,
                  backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--secondary)' : 'var(--accent)'
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
