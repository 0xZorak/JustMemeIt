import React, { useRef, useState, useEffect } from "react";
import { SiX } from "react-icons/si";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Modal from "../components/Modal";

const X_USER_KEY = "xUser";

const Header = ({ lightMode }) => {
  const [xUser, setXUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { isConnected } = useAccount();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isHowToPlayModalOpen, setHowToPlayModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(X_USER_KEY);
    if (stored) setXUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleXLogout = () => {
    setXUser(null);
    localStorage.removeItem(X_USER_KEY);
    setShowDropdown(false);
    window.location.reload();
  };

  // Optional: logout handler for X

  const toggleHowToPlayModal = () => setHowToPlayModalOpen((open) => !open);
  const toggleLoginModal = () => setLoginModalOpen((open) => !open);

  // Real X login: redirect to backend
  const handleXLogin = () => {
    window.location.href = "http://localhost:4000/auth/x/login";
  };

  // Guarded modal toggle
  const guardedToggleLoginModal = () => {
    if (!xUser && !isConnected) setLoginModalOpen((open) => !open);
  };

  return (
    <div
      className="vote-header"
      style={{
        position: "fixed",
        top: 0,
        left: 90,
        right: 0,
        zIndex: 100,
        background: lightMode ? "#eee" : "#181818", // changed from #fff to #eee
        color: lightMode ? "#222" : "#fff",
        borderBottom: lightMode ? "1px solid #eee" : undefined,
      }}
    >
      <span>Just meme it</span>
      <div className="vote-header-bar">
        <button className="how-to-play-btn" onClick={toggleHowToPlayModal}>
          How to Play
        </button>
        {isConnected && !xUser && (
          <>
            <ConnectButton />
            <button className="login-btn" onClick={handleXLogin}>
              Login your <SiX />
            </button>
          </>
        )}
        {xUser && isConnected && (
          <>
            <ConnectButton />
            <div
              style={{ position: "relative", display: "inline-block" }}
              ref={dropdownRef}
            >
              <img
                src={xUser.profile_image_url}
                alt="X Profile"
                className="x-profile-img"
                title="Account"
                style={{ cursor: "pointer" }}
                onClick={() => setShowDropdown((show) => !show)}
              />
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    background: "#222",
                    border: "1px solid #444",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 100,
                    minWidth: 140,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "poppins, sans-serif",
                      padding: "12px 16px",
                      color: "#fff",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    {xUser.name}
                  </div>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      color: "#ff4d4f",
                      border: "none",
                      borderRadius: "0 0 8px 8px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: 500,
                      fontFamily: "poppins, sans-serif",
                    }}
                    onClick={handleXLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {xUser && !isConnected && (
          <>
            <div
              style={{ position: "relative", display: "inline-block" }}
              ref={dropdownRef}
            >
              <img
                src={xUser.profile_image_url}
                alt="X Profile"
                className="x-profile-img"
                title="Account"
                style={{ cursor: "pointer" }}
                onClick={() => setShowDropdown((show) => !show)}
              />
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    background: "#222",
                    border: "1px solid #444",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 100,
                    minWidth: 140,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      color: "#fff",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    {xUser.name}
                  </div>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      color: "#ff4d4f",
                      border: "none",
                      borderRadius: "0 0 8px 8px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: 500,
                    }}
                    onClick={handleXLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <ConnectButton />
          </>
        )}
        {!xUser && !isConnected && (
          <button className="login-btn" onClick={guardedToggleLoginModal}>
            Login
          </button>
        )}
        <Modal
          isOpen={isHowToPlayModalOpen}
          onClose={toggleHowToPlayModal}
          title="How to Play"
        >
          <p>1. Spot a Meme You Love on X</p>
          <p className="sub-text">
            See a funny or viral meme posted by Elon Musk or anyone else?
          </p>
          <p className="sub-text">
            Reply under the tweet with: &gt; @justmemeit_ meme it
          </p>
          <p>2. Collect Memes During the Day</p>
          <p className="sub-text">
            Every meme you “meme’d” gets added to your private dashboard.
          </p>
          <p className="sub-text">
            At the end of the day, you’ll have a collection of your favorite
            memes.
          </p>
          <p>3. Pick Your Best Meme for the Weekly Battle</p>
          <p className="sub-text">
            Once a week, choose one meme from your gallery to enter into the
            Meme Voting Arena.
          </p>
          <p className="sub-text">You only get one entry — make it count.</p>
          <p>4. Let the Battles Begin (Vote with SEI)</p>
          <p className="sub-text">
            All users can browse submitted memes and vote for their favorites
            using $SEI tokens.
          </p>
          <p className="sub-text">1 $SEI = 1 vote.</p>
          <p className="sub-text">
            You can vote on as many memes as you like — once per meme.
          </p>
          <p>5. Top Meme Becomes an NFT</p>
          <p className="sub-text">When the voting ends:</p>
          <p className="sub-text">The winning meme is minted as an NFT.</p>
          <p className="sub-text">
            The creator receives the NFT plus 40% of all voting fees.
          </p>
          <p className="sub-text">
            All voters for that meme receive a reward NFT drop.
          </p>
        </Modal>
        <Modal
          isOpen={isLoginModalOpen && !xUser && !isConnected}
          onClose={toggleLoginModal}
          title="Log in / Sign Up"
          showOK={false}
        >
          <p>New here? We'll help you create an account in no time!</p>
          <div className="login-options">
            <ConnectButton />
            <button className="twitter-btn" onClick={handleXLogin}>
              <SiX /> (Twitter)
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Header;
