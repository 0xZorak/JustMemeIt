import React, { useState, useEffect, useRef } from "react";
import MemeVoteModal from "../components/MemeVoteModal";
import "../styles/vote.css";
import { FaThLarge, FaList } from "react-icons/fa";
import Header from "../components/Header";
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { parseEther } from "viem";
import { useModal } from "../context/ModalContext";

const X_USER_KEY = "xUser";

const Vote = ({ lightMode }) => {
  const { modalOpen } = useModal();
  const [xUser, setXUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [view, setView] = useState("grid");
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [memeVotes, setMemeVotes] = useState({});
  const [votingMemes, setVotingMemes] = useState([]);
  const dropdownRef = useRef(null);

  // On mount: check for X login in URL or localStorage
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

  const VOTE_RECEIVER = "0x6B7e9c7ecC32ECC2Ee7882b35f9A601BbaF5578F";

  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  // Dummy vote handler
  const handleVote = async (voteCount, totalSei) => {
    if (!isConnected) {
      alert("Connect your wallet first!");
      return;
    }
    if (chainId !== 1329) {
      switchChain?.({ chainId: 1329 });
      alert("Please switch your wallet to SEI EVM network.");
      return;
    }
    try {
      // Use totalSei as passed from the modal, do not recalculate
      const value = parseEther(totalSei.toString());
      const tx = await sendTransactionAsync({
        to: VOTE_RECEIVER,
        value,
        chainId: 1329,
      });
      console.log("Transaction result:", tx);

      const txHash = typeof tx === "string" ? tx : tx?.hash;
      if (!txHash) {
        alert("Transaction failed: No txHash returned");
        return;
      }

      // Await and parse the backend response
      const res = await fetch("http://localhost:4000/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memeId: selectedMeme._id,
          memeName: selectedMeme.caption,
          txHash,
          voter: address,
          votes: voteCount,
          value: value.toString(), // must be string, in wei
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMemeVotes((prev) => ({
          ...prev,
          [selectedMeme._id]: (prev[selectedMeme._id] || 0) + voteCount,
        }));
        alert(`You voted ${voteCount} times for a total of ${totalSei} SEI!`);
      } else {
        alert("Vote not counted: " + (data.error || "Unknown error"));
      }
      setSelectedMeme(null);
    } catch (err) {
      alert("Transaction failed: " + err.message);
    }
  };

  // Fetch voting memes from backend
  useEffect(() => {
    const fetchVotingMemes = () => {
      fetch("http://localhost:4000/api/vote/voting-memes")
        .then((res) => res.json())
        .then((data) => setVotingMemes(data.memes || []));
    };
    fetchVotingMemes();
    const interval = setInterval(fetchVotingMemes, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Header lightMode={lightMode} />
      <div
        className="page-scroll-area"
        style={{
          background: lightMode ? "#eee" : undefined,
          minHeight: "100vh",
          filter: modalOpen ? "blur(6px)" : "none",
          transition: "filter 0.2s",
        }}
      >
        {/* Title and grid/list toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            marginBottom: 8,
            padding: "0 32px",
            background: lightMode ? "#eee" : "transparent",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: lightMode ? "#222" : "#aaa",
              fontWeight: 600,
            }}
          >
            VOTE FOR YOUR FAVOURITE MEME
          </div>
          <span style={{ display: "flex", gap: 8 }}>
            <button
              aria-label="Grid view"
              style={{
                background:
                  view === "grid"
                    ? lightMode
                      ? "#2563eb"
                      : "#2563eb"
                    : lightMode
                    ? "#eee"
                    : "#222",
                color: view === "grid" ? "#fff" : lightMode ? "#222" : "#aaa",
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: lightMode ? "0 1px 4px #eee" : undefined,
              }}
              onClick={() => setView("grid")}
            >
              <FaThLarge />
            </button>
            <button
              aria-label="List view"
              style={{
                background:
                  view === "list"
                    ? lightMode
                      ? "#2563eb"
                      : "#2563eb"
                    : lightMode
                    ? "#eee"
                    : "#222",
                color: view === "list" ? "#fff" : lightMode ? "#222" : "#aaa",
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: lightMode ? "0 1px 4px #eee" : undefined,
              }}
              onClick={() => setView("list")}
            >
              <FaList />
            </button>
          </span>
        </div>

        {/* Meme grid/list - new layout */}
        <div
          className="vote-page-grid"
          style={{
            display: view === "grid" ? "grid" : "block",
            gridTemplateColumns:
              view === "grid"
                ? "repeat(auto-fit, minmax(360px, 1fr))"
                : undefined,
            gap: 32,
            padding: "32px 20px 100px 20px", 
          }}
        >
          {votingMemes.length === 0 && (
            <div style={{ color: "#888", fontSize: 18, textAlign: "center" }}>
              No memes in voting round yet.
            </div>
          )}
          {votingMemes.map((meme) => (
            <div
              key={meme._id}
              style={{
                display: "flex",
                flexDirection: view === "grid" ? "row" : "row",
                alignItems: "center",
                background: "#212122ff",
                borderRadius: 18,
                boxShadow: "0 2px 12px #0004",
                padding: 24,
                maxHeight: view === "grid" ? 160 : 90,
                width: view === "grid" ? 360 : "96%",
                margin: view === "grid" ? "auto" : "0 0 20px 0",
                cursor: "pointer",
              }}
              onClick={() => setSelectedMeme(meme)}
            >
              <img
                src={
                  meme.image_url.startsWith("http")
                    ? meme.image_url
                    : `http://localhost:4000${meme.image_url}`
                }
                alt={meme.caption}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 14,
                  objectFit: "cover",
                  marginRight: 28,
                  background: "#222",
                  border: "2px solid #222",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#fff",
                    marginBottom: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 200, // adjust as needed for your layout
                  }}
                  title={meme.caption.length > 120 ? meme.caption : undefined} // show full caption on hover if truncated
                >
                  {meme.caption.length > 120
                    ? meme.caption.slice(0, 117) + "..."
                    : meme.caption}
                </div>
                <div style={{ color: "#aaa", fontSize: 15, marginBottom: 8 }}>
                  by {meme.username || meme.name || "unknown"}
                </div>
                <div
                  style={{
                    color: "#3b82f6",
                    fontWeight: 600,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  <img
                    src="sei_red_symbol.png"
                    alt=""
                    style={{
                      width: 15,
                      height: 15,
                      marginRight: 5,
                    }}
                  />
                  0.005 SEI &nbsp;|&nbsp; Votes: {meme.votes ?? 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meme modal */}
      <MemeVoteModal
        open={!!selectedMeme}
        onClose={() => setSelectedMeme(null)}
        meme={
          selectedMeme && {
            ...selectedMeme,
            meme_image: selectedMeme.image_url.startsWith("http")
              ? selectedMeme.image_url
              : `http://localhost:4000${selectedMeme.image_url}`,
            memeName: selectedMeme.caption, 
            uploader: selectedMeme.username || selectedMeme.name || "unknown",
            price_in_sei: Number(selectedMeme.price_in_sei) || 0.005,
          }
        }
        onVote={handleVote}
      />
    </div>
  );
};

export default Vote;
