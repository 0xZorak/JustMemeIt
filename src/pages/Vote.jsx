import React, { useState, useEffect, useRef } from 'react';
import Modal from '../components/Modal';
import '../styles/vote.css';
import { SiX } from 'react-icons/si';     
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const X_USER_KEY = 'xUser';

const Vote = () => {
  const [isHowToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [xUser, setXUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // wagmi hook for wallet info
  const { address, isConnected } = useAccount();

  // On mount: check for X login in URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const profile_image_url = params.get('profile_image_url');
    if (name && profile_image_url) {
      const user = { name, profile_image_url };
      setXUser(user);
      localStorage.setItem(X_USER_KEY, JSON.stringify(user));
      window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
    } else {
      // Try to load from localStorage
      const stored = localStorage.getItem(X_USER_KEY);
      if (stored) setXUser(JSON.parse(stored));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Optional: logout handler for X
  const handleXLogout = () => {
    setXUser(null);
    localStorage.removeItem(X_USER_KEY);
    setShowDropdown(false);
  };

  const toggleHowToPlayModal = () => setHowToPlayModalOpen((open) => !open);
  const toggleLoginModal = () => setLoginModalOpen((open) => !open);

  // Real X login: redirect to backend
  const handleXLogin = () => {
    window.location.href = 'http://localhost:4000/auth/x/login';
  };

  return (
    <div className="vote-content" style={{ width: '100%', height: '100%' }}>
      {/* Header Bar */}
      <div className="vote-header">
        <span>Just meme it</span>
        <div className="vote-header-bar">
          <button
            className="how-to-play-btn"
            onClick={toggleHowToPlayModal}
          >
            How to Play
          </button>
          {isConnected && !xUser && (
            <>
              <ConnectButton />
              <button
                className="login-btn"
                onClick={handleXLogin}
              >
                Login your <SiX />
              </button>
            </>
          )}
          {xUser && (
            <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
              <img
                src={xUser.profile_image_url}
                alt="X Profile"
                className="x-profile-img"
                title="Account"
                style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
                onClick={() => setShowDropdown((show) => !show)}
              />
              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 8,
                    background: '#222',
                    border: '1px solid #444',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 100,
                    minWidth: 140,
                  }}
                >
                  <div style={{ padding: '12px 16px', color: '#fff', borderBottom: '1px solid #333' }}>
                    {xUser.name}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'none',
                      color: '#ff4d4f',
                      border: 'none',
                      borderRadius: '0 0 8px 8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 500,
                    }}
                    onClick={handleXLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          {/* <ConnectButton /> */}
          {!xUser && !isConnected && (
            <button
              className="login-btn"
              onClick={toggleLoginModal}
            >
              Login
            </button>
          )}
        </div>
      </div>
      
      <Modal 
        isOpen={isHowToPlayModalOpen} 
        onClose={toggleHowToPlayModal} 
        title="How to Play"
      >
        <p>1. Spot a Meme You Love on X</p>
        <p className="sub-text">See a funny or viral meme posted by Elon Musk or anyone else?</p>
        <p className="sub-text">Reply under the tweet with: &gt; @justmemeit_ meme it</p>
        <p>2. Collect Memes During the Day</p>
        <p className="sub-text">Every meme you “meme’d” gets added to your private dashboard.</p>
        <p className="sub-text">At the end of the day, you’ll have a collection of your favorite memes.</p>
        <p>3. Pick Your Best Meme for the Weekly Battle</p>
        <p className="sub-text">Once a week, choose one meme from your gallery to enter into the Meme Voting Arena.</p>
        <p className="sub-text">You only get one entry — make it count.</p>
        <p>4. Let the Battles Begin (Vote with SEI)</p>
        <p className="sub-text">All users can browse submitted memes and vote for their favorites using $SEI tokens.</p>
        <p className="sub-text">1 $SEI = 1 vote.</p>
        <p className="sub-text">You can vote on as many memes as you like — once per meme.</p>
        <p>5. Top Meme Becomes an NFT</p>
        <p className="sub-text">When the voting ends:</p>
        <p className="sub-text">The winning meme is minted as an NFT.</p>
        <p className="sub-text">The creator receives the NFT plus 40% of all voting fees.</p>
        <p className="sub-text">All voters for that meme receive a reward NFT drop.</p>
      </Modal>
      <Modal 
        isOpen={isLoginModalOpen} 
        onClose={toggleLoginModal} 
        title="Log in / Sign Up"
        showOK={false}
      >
        <p>New here? We'll help you create an account in no time!</p>
        <div className="login-options">
          <ConnectButton />
          <button className="twitter-btn" onClick={handleXLogin}><SiX /> (Twitter)</button>
        </div>
      </Modal>
    </div>
  );
};

export default Vote;