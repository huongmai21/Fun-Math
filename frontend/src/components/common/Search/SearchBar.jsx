import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm tài liệu, khóa học, tin tức..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type="submit">
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBar;