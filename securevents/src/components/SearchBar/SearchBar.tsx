import React, { useState } from "react";
import "./SearchBar.css";

type Props = {
  onSearch?: (value: string) => void;
};

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="search-form-group">
      
      {/* LEFT: INPUT */}
      <div className="search-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder=" "
          required
        />
        <label>Search...</label>
      </div>

      {/* RIGHT: BUTTON */}
      <button
        type="button"
        className="search-btn"
        onClick={() => onSearch && onSearch(value)}
      >
        <i className="bi bi-search"></i>
      </button>

    </div>
  );
};

export default SearchBar;