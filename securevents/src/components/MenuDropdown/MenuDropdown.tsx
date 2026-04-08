import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuDropdown.css";

type MenuItem = {
  label: string;
  icon: string;   // bootstrap icon class
  path: string;
};

type Props = {
  items: MenuItem[];
};

const MenuDropdown: React.FC<Props> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="menu-container">
      {/* ☰ Button */}
      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="menu-dropdown">
          {items.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={() => handleClick(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;