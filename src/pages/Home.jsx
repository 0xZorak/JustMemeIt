import React from 'react';
import pineImage from '../images/pine.jpg';

const Home = () => {
  return (
    <div className="home-content">
      <div className="left">
        <p>Welcome to</p>
        <h1>Just meme it</h1>
      </div>
      <div className="right">
        <img src={pineImage} alt="meme" />
      </div>
    </div>
  );
};

export default Home;