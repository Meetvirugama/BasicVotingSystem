import { useEffect, useRef, useState } from "react";
import "../public/sidebar.css";

export default function Sidebar({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("DEFAULT");
  const sidebarRef = useRef(null);

  const handleSelect = type => {
    setActive(type);
    onSelect(type);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside ref={sidebarRef} className={`sidebar ${open ? "open" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(prev => !prev)}
      >
        <i className={`fas ${open ? "fa-times" : "fa-sort-amount-down"}`}></i>
        {open ? "Close" : "Sort By"}
      </button>

      
      <div className="sidebar-options">
        {[
          ["DEFAULT", "Default Order"],
          ["TITLE_ASC", "Title (A–Z)"],
          ["TITLE_DESC", "Title (Z–A)"],
          ["START_ASC", "Start Date (Asc)"],
          ["START_DESC", "Start Date (Desc)"],
          ["END_ASC", "End Date (Asc)"],
          ["END_DESC", "End Date (Desc)"],
          ["POPULAR_DESC", "Most Popular"],
          ["POPULAR_ASC", "Least Popular"],
          ["DURATION", "Poll Duration"]
        ].map(([key, label]) => (
          <button
            key={key}
            className={active === key ? "active" : ""}
            onClick={() => handleSelect(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
