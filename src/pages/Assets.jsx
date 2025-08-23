import React, { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import "../styles/assets.css";
import avatar from "../images/avatar.png";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

export default function Assets() {
  const [xProfileUrl, setXProfileUrl] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const imgRef = useRef();

  const { address: wallet, isConnected } = useAccount();

  useEffect(() => {
    const xUser = JSON.parse(localStorage.getItem("xUser"));
    if (xUser) {
      let imgUrl =
        xUser.profile_image_url_https || xUser.profile_image_url || "";
      if (imgUrl) {
        imgUrl = imgUrl.replace("_normal", "_400x400");
      }
      setXProfileUrl(imgUrl);
      setXHandle(xUser.screen_name || xUser.username || xUser.name || "");
    }
  }, []);

  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    setError("");
    fetch(`https://jmi-backend-5rha.onrender.com/api/nfts?owner=${wallet}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setNfts([]);
        } else if (!Array.isArray(data.nfts)) {
          setError("NFT data format error.");
          setNfts([]);
        } else {
          setNfts(data.nfts);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch NFTs: " + err.message);
        setNfts([]);
        setLoading(false);
      });
  }, [wallet]);

  function getImageUrl(image) {
    if (!image) return "/images/avatar.png";
    if (image.startsWith("ipfs://")) {
      return image.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return image;
  }

  // Parallax effect for banner
  useEffect(() => {
    const banner = document.querySelector(".assets-banner");
    const onScroll = () => {
      if (banner) {
        banner.style.transform = `translateY(${window.scrollY * 0.2}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fade-in animation for NFT cards
  useEffect(() => {
    const cards = document.querySelectorAll(".nft-card");
    const onScroll = () => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
          card.classList.add("fade-in");
        }
      });
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [nfts, view, search, sort]);

  // Search and sort logic
  const filteredNfts = nfts
    .filter(
      (nft) =>
        nft.name?.toLowerCase().includes(search.toLowerCase()) ||
        nft.tokenId?.toString().includes(search)
    )
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.mintedAt) - new Date(a.mintedAt);
      }
      if (sort === "oldest") {
        return new Date(a.mintedAt) - new Date(b.mintedAt);
      }
      if (sort === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

  return (
    <div className="assets-bg">
      <div className="assets-banner">
        <div className="assets-parallax" />
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={xProfileUrl || avatar}
          alt="Profile"
          className="assets-profile-img"
        />
      </div>
      <div className="assets-header">
        <h2 className="assets-handle">{xHandle || "No X Account"}</h2>
        <div className="assets-total">
          Total Items: <b>{nfts.length}</b>
        </div>
      </div>
      <div className="assets-controls">
        <div className="assets-search-wrap">
          <input
            className="assets-search"
            type="text"
            placeholder="Search items"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="assets-view-toggle">
          <button
            className={`assets-toggle-btn${view === "grid" ? " active" : ""}`}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <span className="assets-icon-grid" />
          </button>
          <button
            className={`assets-toggle-btn${view === "list" ? " active" : ""}`}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <span className="assets-icon-list" />
          </button>
        </div>
        <div className="assets-sort-wrap">
          <select
            className="assets-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="assets-section">
        <h3 className="assets-title">Items</h3>
        {error && <div className="assets-error">{error}</div>}
        <div
          className={
            view === "grid" ? "assets-grid" : "assets-list"
          }
        >
          {loading ? (
            <div className="assets-loading">Loading...</div>
          ) : filteredNfts.length === 0 ? (
            <div className="assets-empty">No winning memes yet.</div>
          ) : (
            filteredNfts.map((nft, idx) => (
              <div
                key={nft.tokenId || idx}
                className={`nft-card${view === "list" ? " list" : ""}`}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="nft-img-wrap">
                  <img
                    src={getImageUrl(nft.image)}
                    alt={nft.name}
                    className="nft-img"
                    onError={(e) => {
                      e.target.src = "/images/avatar.png";
                    }}
                  />
                </div>
                <div className="nft-info">
                  <div className="nft-name">{nft.name}</div>
                  <div className="nft-id">
                    Token ID: <span>{nft.tokenId}</span>
                  </div>
                  {view === "list" && (
                    <div className="nft-date">
                      Minted: {new Date(nft.mintedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
