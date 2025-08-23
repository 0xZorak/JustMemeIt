import React, { useEffect, useState } from "react";
import "../styles/rank.css";
import cover from "../images/cover.jpg";

const Rank = () => {
  const [winners, setWinners] = useState([]);

  useEffect(() => {
    fetch("https://jmi-backend-5rha.onrender.com/api/vote/winner")
      .then((res) => res.json())
      .then((data) => {
        setWinners(data.winners || []);
      });
  }, []);

  return (
    <div className="rank-page">
      <div className="rank-parallax-bg"></div>
      <div className="rank-scroll-area">
        <div className="rank-cover-photo rank-fade-in">
          <img src={cover} alt="Leaderboard Cover" />
        </div>
        <h1 className="rank-title neon-text">Announcement</h1>
        <p className="rank-subtitle">CONGRATULATIONS CHAMP!</p>
        <div className="winner-list">
          {winners.length > 0 ? (
            winners.map((winner, idx) => (
              <a
                className="winner-card rank-animate"
                href={winner.xLink}
                target="_blank"
                rel="noopener noreferrer"
                key={winner._id}
              >
                <div className="winner-image">
                  <img
                    src={
                      winner.image_url.startsWith("http")
                        ? winner.image_url
                        : `https://jmi-backend-5rha.onrender.com${winner.image_url}`
                    }
                    alt="Winning Meme"
                  />
                </div>
                <div className="winner-content">
                  <div className="winner-header">
                    <span className="winner-name neon-text">
                      {winner.name}
                    </span>
                  </div>
                  <div className="winner-meme">
                    {winner.meme.split("\n").map((line, i) => (
                      <div key={i}> caption: {line}</div>
                    ))}
                  </div>
                  <div className="winner-votes">
                    <span>Votes: </span>
                    <span className="neon-blue">{winner.votes}</span>
                  </div>
                  <div className="winner-week">
                    Week: {winner.week} (
                    {new Date(winner.timestamp).toLocaleString()})
                  </div>
                </div>
                <div className="confetti"></div>
              </a>
            ))
          ) : (
            <div className="no-winner">No winner yet!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rank;
