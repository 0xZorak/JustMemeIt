import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../images/logo.png';
import { SiX } from 'react-icons/si';     

const Sidebar = ({ lightMode, toggleMode }) => {

  return (
    <div className={`sidebar${lightMode ? ' light-mode' : ''}`}>
      {/* <div className="logo-section">
        <Link className="sidebar-icon active" to="/">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </Link>
   
      </div> */}
      <div className="top-icons">
        <NavLink
          to="/"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="Home"
        >
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </NavLink>
             <div className="logo-underline"></div>
        <NavLink
          to="/vote"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="Vote"
        >
          <i className="fa-solid fa-rocket"></i>
          <span>Vote</span>
        </NavLink>
        <NavLink
          to="/rank"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="Update"
        >
          <i className="fa-solid fa-trophy"></i>
          <span>Update</span>
        </NavLink>
        <NavLink
          to="/assets"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="Assets"
        >
          <i className="fa-solid fa-coins"></i>
          <span>Assets</span>
        </NavLink>
        <NavLink
          to="/user"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="User"
        >
          <i className="fa-solid fa-user"></i>
          <span>User</span>
        </NavLink>
        <NavLink
          to="/memeai"
          className={({ isActive }) =>
            "sidebar-icon" + (isActive ? " active" : "")
          }
          title="MemeAI"
        >
          <i className="fa-solid fa-magic"></i>
          <span>MemeAI</span>
        </NavLink>
      </div>
      <div className="bottom-icons">
       
        <a href="https://x.com/justmemeit_" target="_blank" rel="noopener noreferrer">
          {/* <i className="fa-brands fa-twitter"></i> */}
          <SiX />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;