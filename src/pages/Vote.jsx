import React, { useState, useEffect, useRef } from "react";
import MemeVoteModal from "../components/MemeVoteModal";
import memesData from "../data/memes.json";
import "../styles/vote.css";
import { FaThLarge, FaList } from "react-icons/fa";
import Header from "../components/Header";

const X_USER_KEY = "xUser";

const Vote = () => {
  const [xUser, setXUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [view, setView] = useState("grid");
  const [selectedMeme, setSelectedMeme] = useState(null);
  const dropdownRef = useRef(null);

  // On mount: check for X login in URL or localStorage
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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Dummy vote handler
  const handleVote = () => {
    alert("Vote submitted!");
    setSelectedMeme(null);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Header />
      <div className="page-scroll-area">
        {/* Below header: Title and grid/list toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            marginBottom: 8,
            padding: "0 32px",
          }}
        >
          <div style={{ fontSize: 18, color: "#aaa", fontWeight: 600 }}>
            VOTE FOR YOUR FAVORITE MEME
          </div>
          <span style={{ display: "flex", gap: 8 }}>
            <button
              aria-label="Grid view"
              style={{
                background: view === "grid" ? "#2563eb" : "#222",
                color: view === "grid" ? "#fff" : "#aaa",
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
              }}
              onClick={() => setView("grid")}
            >
              <FaThLarge />
            </button>
            <button
              aria-label="List view"
              style={{
                background: view === "list" ? "#2563eb" : "#222",
                color: view === "list" ? "#fff" : "#aaa",
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
              }}
              onClick={() => setView("list")}
            >
              <FaList />
            </button>
          </span>
        </div>

        {/* Meme grid/list */}
        <div
          style={{
            display: view === "grid" ? "grid" : "block",
            gridTemplateColumns:
              view === "grid"
                ? "repeat(auto-fit, minmax(260px, 1fr))"
                : undefined,
            gap: 24,
            padding: 32,
            paddingTop: 15,
          }}
        >
          {memesData.map((meme, idx) => (
            <div
              key={idx}
              style={{
                background: "#222222ff",
                borderRadius: 16,
                padding: 18,
                marginBottom: view === "list" ? 24 : 0,
                display: "flex",
                flexDirection: view === "grid" ? "column" : "row",
                alignItems: view === "grid" ? "center" : "flex-start",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                minWidth: 220,
                maxWidth: view === "grid" ? 320 : "100%",
                transition: "box-shadow 0.2s",
              }}
              onClick={() => setSelectedMeme(meme)}
            >
              <img
                src={meme.meme_image}
                alt={meme.meme_name}
                style={{
                  width: view === "grid" ? 120 : 80,
                  height: view === "grid" ? 120 : 80,
                  borderRadius: 12,
                  objectFit: "cover",
                  marginBottom: view === "grid" ? 16 : 0,
                  marginRight: view === "list" ? 18 : 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, color: "#fff" }}>
                  {meme.meme_name}
                </div>
                <div style={{ color: "#aaa", fontSize: 14, margin: "6px 0" }}>
                  by {meme.uploader}
                </div>
                <div
                  style={{ color: "#2563eb", fontWeight: 600, fontSize: 16 }}
                >
                  {meme.price_in_sei} SEI
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Meme modal */}
        <MemeVoteModal
          open={!!selectedMeme}
          onClose={() => setSelectedMeme(null)}
          meme={selectedMeme}
          onVote={handleVote}
        />
      </div>
    </div>
  );
};

export default Vote;
