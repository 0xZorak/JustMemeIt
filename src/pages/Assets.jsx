import React, { useEffect, useState } from "react";

// Dummy data for demonstration. Replace with actual props or context.
const xProfileUrl = "/images/avatar.png"; // Replace with actual X profile image URL
const xHandle = "zorak"; // Replace with actual X handle
const assetsWon = [
  { id: 1, name: "Dragon NFT", imageUrl: "/images/cover.jpg" },
  { id: 2, name: "Furby NFT", imageUrl: "/images/dan.jpg" },
  { id: 3, name: "Logo NFT", imageUrl: "/images/logo.png" },
  // Add more assets as needed
];

function getAverageColor(imgUrl, fallback = "#2d184b") {
  // This is a simple fallback. For production, use a library like ColorThief.
  return fallback;
}

export default function Assets() {
  const [bannerColor, setBannerColor] = useState("#2d184b");

  useEffect(() => {
    // For demo, just set a static color. Use ColorThief for dynamic color extraction.
    setBannerColor(getAverageColor(xProfileUrl));
  }, []);

  return (
    <div style={{ background: "#181828", minHeight: "100vh" }}>
      {/* Banner */}
      <div
        style={{
          background: bannerColor,
          height: 180,
          position: "relative",
          marginBottom: 60,
        }}
      >
        {/* Profile Picture */}
        <img
          src={xProfileUrl}
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
          }}
        />
      </div>
      {/* Profile Info */}
      <div style={{ marginLeft: 180, marginTop: -40 }}>
        <h2 style={{ color: "#fff", marginBottom: 8 }}>{xHandle}</h2>
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
          {assetsWon.map((asset) => (
            <div
              key={asset.id}
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
                src={asset.imageUrl}
                alt={asset.name}
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
              <div>{asset.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}