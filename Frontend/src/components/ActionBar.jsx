import { Link } from "react-router-dom";
import Sidebar from "./filterSidebar";
import Search from "./search";
import "../public/actionBar.css";
import Navbar from "./Navbar";

export default function ActionBar({ search, setSearch, setSort }) {
  return (
    <section className="action-section">
      <Navbar />
      <div className="action-bar">
        <Link to="/election/create" className="btn create">
          ➕ Create Election
        </Link>

        <Sidebar onSelect={setSort} />

        <Search
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
        />
      </div>
    </section>
  );
}
