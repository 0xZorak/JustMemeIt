import React from 'react';
import Header from '../components/Header';

const Rank = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Header />
      <div className="page-scroll-area">
        <h1>Leaderboard</h1>
        <p>See the top memes and creators!</p>
        {/* Leaderboard content goes here */}
      </div>
    </div>
  );
};

export default Rank;