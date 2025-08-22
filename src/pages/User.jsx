import React, { useState, useEffect } from "react";
import "../styles/user.css";
import { LuWallet } from "react-icons/lu";
import { FaTrash, FaTrashAlt } from "react-icons/fa";
import Modal from "../components/Modal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import avatar from "../images/avatar.png";
import { CgProfile } from "react-icons/cg";
import { useModal } from "../context/ModalContext";
const X_USER_KEY = "xUser";

const User = () => {
  const [userMemes, setUserMemes] = useState([]);
  const [selectedMemeId, setSelectedMemeId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [hoveredTrash, setHoveredTrash] = useState(null);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { modalOpen } = useModal();
  const [xUser, setXUser] = useState(null);
  const { address, isConnected } = useAccount();
  const [alertMsg, setAlertMsg] = useState("");

 
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get("user_id");
    const name = params.get("name");
    const profile_image_url = params.get("profile_image_url");
    if (user_id && name && profile_image_url) {
      const user = { user_id, name, profile_image_url };
      setXUser(user);
      localStorage.setItem(X_USER_KEY, JSON.stringify(user));
      window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
    } else {
      const stored = localStorage.getItem(X_USER_KEY);
      if (stored) setXUser(JSON.parse(stored));
    }
  }, []);


  useEffect(() => {
    if (!isLoginModalOpen) {
      const stored = localStorage.getItem(X_USER_KEY);
      if (stored) setXUser(JSON.parse(stored));
    }
  }, [isLoginModalOpen]);


  useEffect(() => {
    if (xUser) {
      fetch(`https://justmemeit.onrender.com/api/vote/user-memes/${xUser.user_id}`)
        .then((res) => res.json())
        .then((data) => setUserMemes(data.memes || []));
    }
  }, [xUser]);

  
  const handleCloseModal = () => {
    if (xUser && isConnected) setLoginModalOpen(false);
  };


  const handleSelectMeme = (meme) => {
    if (meme.in_voting) return; 
    setSelectedMemeId(meme._id);
    setEditCaption(meme.caption);
  };


  const sendForVoting = async () => {
    if (!selectedMemeId) return;
    const res = await fetch("https://justmemeit.onrender.com/api/vote/send-for-voting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meme_id: selectedMemeId,
        caption: editCaption,
        username: xUser?.name,
        name: xUser?.name,
        creator_wallet_address: address,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showAlert("Meme sent for voting!"); 
      setUserMemes((memes) =>
        memes.map((m) =>
          m._id === selectedMemeId
            ? { ...m, in_voting: true, caption: editCaption }
            : m
        )
      );
      setSelectedMemeId(null);
    }
  };


  const deleteMeme = async (meme_id) => {
    if (!window.confirm("Are you sure you want to delete this meme?")) return;
    const res = await fetch(
      `https://justmemeit.onrender.com/api/vote/delete-meme/${meme_id}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();
    if (data.success) {
      setUserMemes((memes) => memes.filter((m) => m._id !== meme_id));
      if (selectedMemeId === meme_id) setSelectedMemeId(null);
    }
  };

  const updateCaption = async (meme_id, newCaption) => {
    const res = await fetch(
      `https://justmemeit.onrender.com/api/vote/update-caption/${meme_id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: newCaption }),
      }
    );
    const data = await res.json();
    if (data.success) {
      setUserMemes((memes) =>
        memes.map((m) =>
          m._id === meme_id ? { ...m, caption: newCaption } : m
        )
      );
    }
  };


  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(""), 2000);
  };

  const needsUnlock = !(xUser && isConnected);

  return (
    <div className="user-page">
      {alertMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: "#222222ff",
            color: "#00e676",
            padding: "14px 32px",
            borderRadius: 12,
            boxShadow: "0 2px 12px #0004",
            fontSize: 18,
            zIndex: 9999,
            minWidth: 320,
            textAlign: "center",
          }}
        >
          {alertMsg}
        </div>
      )}
      <div
        style={{
          filter: alertMsg ? "blur(6px)" : modalOpen ? "blur(6px)" : "none",
          transition: "filter 0.2s",
        }}
      >
        {needsUnlock ? (
          <>
            <div className="user-profile-unlock-row">
              <div className="profile-card-container">
                <div className="profile-title">Profile</div>
                <div className="user-avatar-wrapper">
                  <img src={avatar} alt="avatar" className="user-avatar" />
                </div>
                <div className="user-info-list">
                  <div className="user-info-row">
                    <CgProfile /> : *****
                  </div>
                  <div className="user-info-row">
                    <LuWallet /> : *****
                  </div>
                </div>
              </div>
              <div className="unlock-section">
                <div className="main-content-center">
                  <div className="main-content-message">
                    Please log in / sign up to view.
                  </div>
                  <button
                    className="unlock-main-btn"
                    onClick={() => setLoginModalOpen(true)}
                  >
                    Unlock Now &gt;
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (

          <div className="user-profile-unlock-row">
            <div className="profile-card-container">
              <div className="profile-title">Profile</div>
              <div className="user-avatar-wrapper">
                <img
                  src={
                    xUser
                      ? xUser.profile_image_url.replace("_normal", "_400x400")
                      : "/images/avatar-placeholder.png"
                  }
                  alt="avatar"
                  className="user-avatar"
                />
              </div>
              <div className="user-info-list">
                <div className="user-info-row">
                  <CgProfile /> : {xUser.name}
                </div>
                <div className="user-info-row">
                  <LuWallet /> : {address}
                </div>
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
                <div className="user-memes-section">
                  <h2>Your Uploaded Memes</h2>
                  <div className="user-memes-grid">
                    {userMemes.map((meme) => (
                      <div
                        key={meme._id}
                        className={`user-meme-card${
                          selectedMemeId === meme._id ? " selected" : ""
                        }${meme.in_voting ? " in-voting" : ""}`}
                        style={{
                          border:
                            selectedMemeId === meme._id
                              ? "2px solid #2563eb"
                              : "1px solid #222",
                          background: "#181818",
                          borderRadius: 18,
                          boxShadow: "0 2px 12px #0004",
                          overflow: "hidden",
                          position: "relative",
                          cursor: meme.in_voting ? "not-allowed" : "pointer",
                          transition: "box-shadow 0.2s",
                          minWidth: 180,
                          maxWidth: 220,
                          margin: "auto 20px",
                        }}
                        onClick={() => handleSelectMeme(meme)}
                      >
                        <img
                          src={`http://justmemeit.onrender.com/${meme.image_url}`}
                          alt={meme.caption}
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            objectFit: "cover",
                            borderRadius: 0,
                            display: "block",
                          }}
                        />
                        {meme.in_voting && (
                          <div
                            style={{
                              position: "absolute",
                              top: 10,
                              left: 10,
                              background: "#2563eb",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "2px 10px",
                              fontSize: 13,
                              fontWeight: 700,
                              zIndex: 2,
                            }}
                          >
                            IN VOTING
                          </div>
                        )}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            width: "100%",
                            background: "rgba(0, 0, 0, 0.29)",
                            color: "#fff",
                            padding: "5px 0",
                            fontSize: 14,
                            fontWeight: 500,
                            borderBottomLeftRadius: 18,
                            borderBottomRightRadius: 18,
                          }}
                        >
                          <div style={{ marginTop: 2 }}>
                            <span style={{ fontWeight: 700 }}></span>{" "}
                            {selectedMemeId === meme._id ? (
                              <input
                                type="text"
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={async (e) => {
                                  if (e.key === "Enter") {
                                    await updateCaption(meme._id, editCaption);
                                    setSelectedMemeId(null);
                                  }
                                }}
                                style={{
                                  fontWeight: 600,
                                  fontSize: 15,
                                  border: "1px solid #444",
                                  borderRadius: 4,
                                  padding: "2px 6px",
                                  width: "90%",
                                  background: "#222",
                                  color: "#fff",
                                }}
                                autoFocus
                              />
                            ) : (
                              meme.caption
                            )}
                          </div>
                        </div>
                        <button
                          className="delete-meme-btn"
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: "rgba(30, 30, 30, 0)",
                            color:
                              hoveredTrash === meme._id
                                ? "#ff0000ff"
                                : "#00000079",
                            border: "none",
                            borderRadius: "50%",
                            padding: 8,
                            fontSize: 20,
                            cursor: "pointer",
                            zIndex: 2,
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={() => setHoveredTrash(meme._id)}
                          onMouseLeave={() => setHoveredTrash(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMeme(meme._id);
                          }}
                          title="Delete"
                        >
                          {hoveredTrash === meme._id ? (
                            <FaTrashAlt />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="send-for-voting-btn"
                    style={{
                      marginTop: 24,
                      width: 300,
                      height: 50,
                      background: selectedMemeId ? "#2563eb" : "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "center",
                      fontSize: 16,
                      cursor: selectedMemeId ? "pointer" : "not-allowed",
                    }}
                    disabled={!selectedMemeId}
                    onClick={sendForVoting}
                  >
                    SEND MEME FOR VOTING
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        title="Log in / Sign Up"
        showOK={false}
      >
        <div className="login-options">
          <ConnectButton />
          <button
            className="twitter-btn"
            onClick={() =>
              (window.location.href = "http://justmemeit.onrender.com/auth/x/login")
            }
          >
            Connect X
          </button>
        </div>
        <div style={{ marginTop: 16, color: "#888", fontSize: 14 }}>
          Connect both your wallet and X account to unlock your profile.
        </div>
      </Modal>
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
