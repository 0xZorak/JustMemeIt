import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo.png';
import { SiX } from 'react-icons/si';     
import { useModal } from "../context/ModalContext";

const Sidebar = ({ lightMode, toggleMode }) => {
  // No need to use setModalOpen here

  return (
    <div className={`sidebar${lightMode ? ' light-mode' : ''}`}>
      <div className="logo-section">
        <Link className="sidebar-icon active" to="/">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </Link>
        <div className="logo-underline"></div>
      </div>
      <div className="top-icons">
        <Link className="sidebar-icon" to="/vote">
          <i className="fa-solid fa-rocket"></i>
          <span>Vote</span>
        </Link>
        <Link className="sidebar-icon" to="/rank">
          <i className="fa-solid fa-trophy"></i>
          <span>Rank</span>
        </Link>
        <Link className="sidebar-icon" to="/assets">
          <i className="fa-solid fa-coins"></i>
          <span>Assets</span>
        </Link>
        <Link className="sidebar-icon" to="/user">
          <i className="fa-solid fa-user"></i>
          <span>User</span>
        </Link>
      </div>
      <div className="bottom-icons">
        <a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer">
          <i className="fa-solid fa-book"></i>
        </a>
        <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
          {/* <i className="fa-brands fa-twitter"></i> */}
          <SiX />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;