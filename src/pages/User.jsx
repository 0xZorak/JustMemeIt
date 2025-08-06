import React, { useState, useEffect } from 'react';
import '../styles/user.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Modal from '../components/Modal';
import avatar from '../images/avatar.png';
import { LuWallet } from "react-icons/lu"; 

const X_USER_KEY = 'xUser';

const User = () => {
  const [xUser, setXUser] = useState(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const { address, isConnected } = useAccount();

  // Load X user from localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const profile_image_url = params.get("profile_image_url");
    if (name && profile_image_url) {
      const user = { name, profile_image_url };
      setXUser(user);
      localStorage.setItem(X_USER_KEY, JSON.stringify(user));
      window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
    } else {
      const stored = localStorage.getItem(X_USER_KEY);
      if (stored) setXUser(JSON.parse(stored));
    }
  }, []);

  // Reload xUser when modal closes (after X connect)
  useEffect(() => {
    if (!isLoginModalOpen) {
      const stored = localStorage.getItem(X_USER_KEY);
      if (stored) setXUser(JSON.parse(stored));
    }
  }, [isLoginModalOpen]);

  // Only allow modal to close if both are connected
  const handleCloseModal = () => {
    if (xUser && isConnected) setLoginModalOpen(false);
  };

  // Show unlock screen if not both connected
  const needsUnlock = !(xUser && isConnected);

  return (
    <div className="user-page">
      {needsUnlock ? (
        <>
        
          <div className="user-profile-unlock-row">
            <div className="profile-card-container">
              <div className="profile-title">Profile</div>
              <div className="user-avatar-wrapper">
                <img
                  src={avatar}
                  alt="avatar"
                  className="user-avatar"
                />
              </div>
              <div className="user-info-list">
                <div className="user-info-row">Name: *****</div>
                <div className="user-info-row"><LuWallet />*****</div>
              </div>
            </div>
            <div className="unlock-section">
              <div className="main-content-center">
                <div className="main-content-message">Please log in / sign up to view.</div>
                <button
                  className="unlock-main-btn"
                  onClick={() => setLoginModalOpen(true)}
                >
                  Unlock Now &gt;
                </button>
              </div>
            </div>
          </div>
          <Modal
            isOpen={isLoginModalOpen}
            onClose={handleCloseModal}
            title="Log in / Sign Up"
            showOK={false}
          >
            <div className="login-options">
              <ConnectButton />
              <button className="twitter-btn" onClick={() => window.location.href = 'http://localhost:4000/auth/x/login?redirect=/user'}>
                Connect X
              </button>
            </div>
            <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
              Connect both your wallet and X account to unlock your profile.
            </div>
          </Modal>
        </>
      ) : (
        // Show user profile when both are connected
        <div className="user-profile-unlock-row">
          <div className="profile-card-container">
            <div className="profile-title">Profile</div>
            <div className="user-avatar-wrapper">
              <img
                src={xUser ? xUser.profile_image_url : "/images/avatar-placeholder.png"}
                alt="avatar"
                className="user-avatar"
              />
            </div>
            <div className="user-info-list">
              <div className="user-info-row">{xUser.name}</div>
              <div className="user-info-row"><LuWallet /> {address}</div>
            </div>
            <button
              className="logout-btn"
              onClick={() => setLogoutModalOpen(true)}
            >
              Logout
            </button>
          </div>
          <div className="unlock-section">
            <div className="main-content-center">
              {/* You can add additional content here if needed */}
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Log out"
        showOK={false}
      >
        <div className="logout-options login-options">
          <button
            className="logout-main-btn unlock-main-btn"
            onClick={() => {
              localStorage.clear();
              setLogoutModalOpen(false);
              window.location.reload();
            }}
          >
            Log out from X
          </button>
          <button
            className="logout-main-btn unlock-main-btn"
            onClick={() => {
              localStorage.clear();
              setLogoutModalOpen(false);
              window.location.reload();
            }}
          >
            Log out from Wallet
          </button>
          <button
            className="logout-main-btn unlock-main-btn"
            onClick={() => {
              localStorage.clear();
              setLogoutModalOpen(false);
              window.location.reload();
            }}
          >
            Log out from Both
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default User;