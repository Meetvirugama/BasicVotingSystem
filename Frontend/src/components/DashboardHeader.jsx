import { UserButton } from "@clerk/react";
import { useLocation } from "react-router-dom";
import "../public/header.css";

export default function DashboardHeader({ onToggleSidebar }) {
  const location = useLocation();

  const getTitle = () => {
    switch (location.pathname) {
      case "/": return "Platform Overview";
      case "/upcoming": return "Active Voting Sessions";
      case "/results": return "Results & Analytics";
      case "/profile": return "Account Settings";
      case "/election/create": return "Launch New Poll";
      case "/admin/audit": return "System Audit Logs";
      default: return "Secure Voting Platform";
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="header-title">{getTitle()}</h1>
      </div>

      <div className="header-right">
        <div className="search-pill">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search sessions, tags, or IDs..." />
        </div>

        <div className="header-actions">
           <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">NETWORK SECURE</span>
           </div>
           <UserButton afterSignOutUrl="/verify" />
        </div>
      </div>
    </header>
  );
}
