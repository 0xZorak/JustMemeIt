import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";

const Home = ({ lightMode }) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (vantaEffect.current) {
      vantaEffect.current.destroy();
      vantaEffect.current = null;
    }
    vantaEffect.current = GLOBE({
      el: vantaRef.current,
      THREE: THREE,
      mouseControls: false,
      touchControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: lightMode ? 0x222222 : 0xffffff,
      color2: lightMode ? 0x222222 : 0xffffff,
      backgroundColor: lightMode ? 0xeeeeee : 0x000000,
      size: 1.2,
      points: 12.0,
    });
    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, [lightMode]);

  return (
    <div
      className="home-bg-wrapper"
      style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}
    >
      {/* Vanta Globe Background */}
      <div
        ref={vantaRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
        }}
      />
      {/* Content */}
      <div className="home-content" style={{ position: "relative", zIndex: 1 }}>
        <div className="left">
          <p>Welcome to</p>
          <h1>Just meme it</h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
