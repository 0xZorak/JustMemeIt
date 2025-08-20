import React, { useEffect, useState, useRef } from "react";
import ColorThief from "color-thief-browser";

export default function Assets() {
  const [xProfileUrl, setXProfileUrl] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [bannerColor, setBannerColor] = useState("#2d184b");
  const [assetsWon, setAssetsWon] = useState([]);
  const imgRef = useRef();
  

  // Get user info from localStorage
  useEffect(() => {
    const xUser = JSON.parse(localStorage.getItem("xUser"));
    if (xUser) {
      let imgUrl =
        xUser.profile_image_url_https ||
        xUser.profile_image_url ||
        "";
      if (imgUrl) {
        imgUrl = imgUrl.replace("_normal", "_400x400");
      }
      setXProfileUrl(imgUrl);
      setXHandle(xUser.screen_name || xUser.username || xUser.name || "");
    }
  }, []);

  // Fetch wallet address from localStorage (adjust key as needed)
  const wallet = localStorage.getItem("wallet") || localStorage.getItem("address") || "";

  // Fetch winning memes from backend
  useEffect(() => {
    if (!wallet) return;
    fetch(`/api/winning-memes?wallet=${wallet}`)
      .then(res => res.json())
      .then(data => {
        // Defensive: ensure array
        if (Array.isArray(data)) setAssetsWon(data);
        else setAssetsWon([]);
      })
      .catch((err) => {
        console.error("Failed to fetch winning memes:", err);
        setAssetsWon([]);
      });
  }, [wallet]);



  return (
    <div style={{ background: "#181818", minHeight: "100vh" }}>
      {/* Banner */}
      <div
        style={{
          height: 100,
          position: "relative",
          marginBottom: 60,
          overflow: "visible",
          paddingBottom: 60,
        }}
      >
        <div className="flowing-gradient-banner" />
        {/* Profile Picture and Upload Button here */}
        {/* Profile Picture */}
        <img
          ref={imgRef}
          crossOrigin="anonymous"
          src={xProfileUrl || "/images/avatar.png"}
          alt="Profile"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "4px solid #181828",
            position: "absolute",
            left: 40,
            bottom: -60,
            background: "#222",
            objectFit: "cover",
            
            zIndex: 2, // <-- Make sure this is above the gradient
          }}
        />
        
      </div>
      {/* Profile Info */}
      <div style={{ marginLeft: 180, marginTop: -40 }}>
        <h2 style={{ color: "#fff", marginBottom: 8 }}>
          {xHandle || "No X Account"}
        </h2>
        <div style={{ color: "#ccc", fontSize: 18 }}>
          Total Items: <b>{assetsWon.length}</b>
        </div>
      </div>
      {/* Items Section */}
      <div style={{ margin: "40px 40px 0 40px" }}>
        <h3 style={{ color: "#fff", marginBottom: 16 }}>Items</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 24,
          }}
        >
          {assetsWon.length === 0 ? (
            <div style={{ color: "#aaa" }}>No winning memes yet.</div>
          ) : (
            assetsWon.map((asset, idx) => {
              // Support both camelCase and snake_case
              const imageUrl = asset.imageUrl || asset.image_url || "/images/avatar.png";
              const name = asset.name || asset.caption || "Untitled Meme";
              const key = asset._id || asset.id || idx;
              return (
                <div
                  key={key}
                  style={{
                    background: "#222",
                    borderRadius: 12,
                    padding: 12,
                    textAlign: "center",
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                    onError={e => { e.target.src = "/images/avatar.png"; }}
                  />
                  <div>{name}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
