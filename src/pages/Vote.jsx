import React, { useState, useEffect, useRef } from "react";
import MemeVoteModal from "../components/MemeVoteModal";
import memesData from "../data/memes.json";
import "../styles/vote.css";
import { FaThLarge, FaList } from "react-icons/fa";
import Header from "../components/Header";
import { useAccount, useSendTransaction, useSwitchChain, useChainId } from "wagmi";
import { parseEther } from "viem";

const X_USER_KEY = "xUser";

const Vote = ({ lightMode }) => {
  const [xUser, setXUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [view, setView] = useState("grid");
  const [selectedMeme, setSelectedMeme] = useState(null);
  const [memeVotes, setMemeVotes] = useState({}); // { memeId: voteCount }
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
      const totalSei = selectedMeme.price_in_sei * voteCount;
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
      const res = await fetch('http://localhost:4000/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeName: selectedMeme.memeName,
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
          [selectedMeme.memeName]: data.votes,
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

  useEffect(() => {
    memesData.forEach(meme => {
      fetch(`http://localhost:4000/api/vote/${meme.memeName}`)
        .then(res => res.json())
        .then(data => {
          setMemeVotes(prev => ({
            ...prev,
            [meme.memeName]: data.votes,
          }));
        });
    });
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Header lightMode={lightMode} />
      <div className="page-scroll-area" style={{
        background: lightMode ? "#eee" : undefined,
        minHeight: "100vh"  
      }}>
        {/* Below header: Title and grid/list toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            marginBottom: 8,
            padding: "0 32px",
            background: lightMode ? "#eee" : "transparent"
          }}
        >
          <div style={{
            fontSize: 18,
            color: lightMode ? "#222" : "#aaa",
            fontWeight: 600
          }}>
            VOTE FOR YOUR FAVOURITE MEME
          </div>
          <span style={{ display: "flex", gap: 8 }}>
            <button
              aria-label="Grid view"
              style={{
                background: view === "grid"
                  ? (lightMode ? "#2563eb" : "#2563eb")
                  : (lightMode ? "#eee" : "#222"), // keep #eee for light mode
                color: view === "grid"
                  ? "#fff"
                  : (lightMode ? "#222" : "#aaa"),
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: lightMode ? "0 1px 4px #eee" : undefined
              }}
              onClick={() => setView("grid")}
            >
              <FaThLarge />
            </button>
            <button
              aria-label="List view"
              style={{
                background: view === "list"
                  ? (lightMode ? "#2563eb" : "#2563eb")
                  : (lightMode ? "#eee" : "#222"), // keep #eee for light mode
                color: view === "list"
                  ? "#fff"
                  : (lightMode ? "#222" : "#aaa"),
                border: "none",
                borderRadius: 6,
                padding: 6,
                cursor: "pointer",
                fontSize: "18px",
                boxShadow: lightMode ? "0 1px 4px #eee" : undefined
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
            background: lightMode ? "#f7f7f7" : undefined
          }}
        >
          {memesData.map((meme, idx) => (
            <div
              key={idx}
              style={{
                background: lightMode ? "#eee" : "#222222ff", // changed from #fff to #eee
                borderRadius: 16,
                padding: 18,
                marginBottom: view === "list" ? 24 : 0,
                display: "flex",
                flexDirection: view === "grid" ? "column" : "row",
                alignItems: view === "grid" ? "center" : "flex-start",
                cursor: "pointer",
                boxShadow: lightMode
                  ? "0 2px 8px rgba(0,0,0,0.04)"
                  : "0 2px 8px rgba(0,0,0,0.10)",
                minWidth: 220,
                maxWidth: view === "grid" ? 320 : "100%",
                transition: "box-shadow 0.2s",
                border: lightMode ? "1px solid #eee" : undefined
              }}
              onClick={() => setSelectedMeme(meme)}
            >
              <img
                src={meme.meme_image}
                alt={meme.memeName}
                style={{
                  width: view === "grid" ? 120 : 80,
                  height: view === "grid" ? 120 : 80,
                  borderRadius: 12,
                  objectFit: "cover",
                  marginBottom: view === "grid" ? 16 : 0,
                  marginRight: view === "list" ? 18 : 0,
                  border: lightMode ? "1px solid #eee" : undefined,
                  background: lightMode ? "#eee" : "#222" // changed from #fafafa to #eee
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 18,
                  color: lightMode ? "#222" : "#fff"
                }}>
                  {meme.memeName}
                </div>
                <div style={{
                  color: lightMode ? "#888" : "#aaa",
                  fontSize: 14,
                  margin: "6px 0"
                }}>
                  by {meme.uploader}
                </div>
                <div style={{
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: 16
                }}>
                  {meme.price_in_sei} SEI &nbsp;|&nbsp; Votes: {memeVotes[meme.memeName] || 0}
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
