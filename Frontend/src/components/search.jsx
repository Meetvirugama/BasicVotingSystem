import "../public/search.css";

export default function Search({ value, onChange, onClear }) {
  return (
    <form
      className="search-box"
      role="search"
      onReset={(e) => {
        e.preventDefault();
        onClear();
      }}
    >
      <input
        type="text"
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search"
      />
      <button type="reset" aria-label="Clear search" />
    </form>
  );
}
