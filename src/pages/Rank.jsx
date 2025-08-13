import React, { useEffect, useState } from "react";
import "../styles/rank.css";
import cover from "../images/cover.jpg";

const Rank = () => {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/vote/winner")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched winners:", data.winners);
        setWinners(data.winners || []);
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="page-scoll-area">
        <div className="rank-cover-photo">
          <img src={cover} alt="Leaderboard Cover" />
        </div>
        <h1 style={{ marginLeft: "30px" }}>Announcement</h1>
        <p style={{ marginLeft: "30px" }}>CONGRATULATION CHAMP!</p>
        <div className="winner-list">
          {winners.length > 0 ? (
            winners.map((winner, idx) => (
              <a
                className="winner-card rank-animate"
                href={winner.xLink}
                target="_blank"
                rel="noopener noreferrer"
                key={winner._id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "32px",
                  padding: "24px",
                  background: "#181818",
                  borderRadius: "18px",
                  marginBottom: "32px",
                  textDecoration: "none",
                  color: "inherit",
                  maxWidth: "700px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div className="winner-image" style={{ flex: "0 0 300px" }}>
                  <img
                    src={
                      winner.image_url.startsWith("http")
                        ? winner.image_url
                        : `http://localhost:4000${winner.image_url}`
                    }
                    alt="Winning Meme"
                    style={{
                      maxWidth: 300,
                      borderRadius: 12,
                      marginTop: 0,
                      display: "block",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                    }}
                  />
                </div>
                <div className="winner-content" style={{ flex: 1 }}>
                  <div className="winner-header">
                    <span
                      className="winner-name"
                      style={{ fontWeight: "bold", fontSize: 22 }}
                    >
                      {winner.name}
                    </span>
                  </div>
                  <div
                    className="winner-meme"
                    style={{ margin: "10px 0", color: "#ccc" }}
                  >
                    {winner.meme.split("\n").map((line, i) => (
                      <div key={i}> caption: {line}</div>
                    ))}
                  </div>
                  <div style={{ color: "#8ab4f8", marginTop: 8 }}>
                    Votes: {winner.votes}
                  </div>
                  <div style={{ color: "#aaa", marginTop: 4, fontSize: 14 }}>
                    Week: {winner.week} (
                    {new Date(winner.timestamp).toLocaleString()})
                  </div>
                </div>
                {/* Animated confetti effect */}
                <div className="confetti"></div>
              </a>
            ))
          ) : (
            <div
              style={{
                color: "#888",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              No winner yet!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rank;
