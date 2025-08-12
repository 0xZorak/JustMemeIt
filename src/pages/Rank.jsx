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
                className="winner-card"
                href={winner.xLink}
                target="_blank"
                rel="noopener noreferrer"
                key={winner._id}
              >
                <div className="winner-avatar">
                  {/* <img src={winner.avatar} alt={winner.name} /> */}
                  {/* <span className="winner-rank">#{winner.rank}</span> */}
                </div>
                <div className="winner-content">
                  <div className="winner-header">
                    <span className="winner-name">{winner.name}</span>
                    {/* <span className="winner-username">{winner.username}</span> */}
                  </div>
                  <div className="winner-meme">
                    {winner.meme.split("\n").map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                  <div>
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
                        marginTop: 12,
                      }}
                    />
                  </div>
                  <div style={{ color: "#8ab4f8", marginTop: 8 }}>
                    Votes: {winner.votes}
                  </div>
                  <div style={{ color: "#aaa", marginTop: 4, fontSize: 14 }}>
                    Week: {winner.week} (
                    {new Date(winner.timestamp).toLocaleString()})
                  </div>
                </div>
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
