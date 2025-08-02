import React, { useState, useRef } from 'react';
import pineImage from '../images/pine.jpg';
import newImage from '../images/hio.jpg';
import catImage from '../images/cat.jpg';
import danImage from '../images/dan.jpg'; 
import woofImage from '../images/woof.jpg';
import '../styles/glitch.css';

const images = [pineImage, newImage, catImage, danImage, woofImage]; 

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliding, setSliding] = useState(false);

  React.useEffect(() => {
    setSliding(true);
    const slideTimeout = setTimeout(() => setSliding(false), 500); // Animation duration

    const interval = setInterval(() => {
      setSliding(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setSliding(false), 500);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(slideTimeout);
    };
  }, []);

  return (
    <div className="home-content">
      <div className="left">
        <p>Welcome to</p>
        <h1>Just meme it</h1>
      </div>
      <div className="right">
        <img
          src={images[currentIndex]}
          alt="meme"
          className={sliding ? 'slide-in' : ''}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default Home;