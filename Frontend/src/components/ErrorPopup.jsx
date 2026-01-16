import "../public/errorPopup.css";

export default function ErrorPopup({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-overlay">
      <div className="error-card">
        <h3>⚠️ Error</h3>
        <p>{message}</p>

        {/* 👇 Footer credit */}
        <span className="error-credit">
          Developed by Meet Virugama
        </span>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
