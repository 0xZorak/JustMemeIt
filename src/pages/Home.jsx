import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.globe.min";
import pepeImg from "../images/mili.png";
import pepeIm from "../images/frpo.png";
import pepeI from "../images/seiyan.png";
import pepe from "../images/shenro.png"; 
import pep from "../images/popos.png";// Adjust the path if needed

const CURTAIN_COLORS = [
  "#000", // green
  "#111", // pink
  "#222", // blue
  "#333", // yellow
  "#444", // orange
];

const Home = ({ lightMode }) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const [curtainStates, setCurtainStates] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [curtainDone, setCurtainDone] = useState(false);

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
      backgroundColor: 0x181818,
      size: 1.2,
      points: 12.0,
    });
    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, [lightMode]);

  // Curtain animation: trigger each curtain up one by one
  useEffect(() => {
    let timers = [];
    for (let i = CURTAIN_COLORS.length - 1; i >= 0; i--) {
      timers.push(
        setTimeout(() => {
          setCurtainStates((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, (CURTAIN_COLORS.length - 1 - i) * 500)
      );
    }
    // After all curtains are up, remove the overlay
    timers.push(
      setTimeout(() => setCurtainDone(true), CURTAIN_COLORS.length * 500)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div
      className="home-bg-wrapper"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
      }}
    >
      {/* Curtain Animation Overlay */}
      {!curtainDone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            display: "flex",
            width: "100vw",
            height: "100vh",
          }}
        >
          {CURTAIN_COLORS.map((color, i) => (
            <div
              key={color}
              style={{
                flex: 1,
                minWidth: 0, // <-- Add this line
                background: color,
                position: "relative",
                overflow: "hidden",
                transform: curtainStates[i]
                  ? "translateY(-100%)"
                  : "translateY(0)",
                transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                willChange: "transform",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Pepe image only on the #000 curtain */}
              {color === "#000" && (
                <img
                  src={pepeImg}
                  alt="Pepe"
                  style={{
                    position: "absolute",
                    top: "70%",
                    left: "50%",
                    width: 300,
                    height: 900,
                    objectFit: "contain",
                    transform: curtainStates[i]
                      ? "translate(-50%, calc(-50% - 100vh))"
                      : "translate(-50%, -50%)",
                    transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              )}
              
              {/* frpo image only on the #222 curtain */}
              {color === "#222" && (
                <img
                  src={pepeIm}
                  alt="Frpo"
                  style={{
                    position: "absolute",
                    top: "75%",
                    left: "50%",
                    width: 300,
                    height: 900,
                    objectFit: "contain",
                    transform: curtainStates[i]
                      ? "translate(-50%, calc(-50% - 100vh))"
                      : "translate(-50%, -50%)",
                    transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              )}
              {color === "#111" && (
                <img
                  src={pepeI}
                  alt="Frpo"
                  style={{
                    position: "absolute",
                    top: "80%",
                    left: "50%",
                    width: 300,
                    height: 900,
                    objectFit: "contain",
                    transform: curtainStates[i]
                      ? "translate(-50%, calc(-50% - 100vh))"
                      : "translate(-50%, -50%)",
                    transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                    />
              )}
               {color === "#333" && (
                <img
                  src={pep}
                  alt="Frpo"
                  style={{
                    position: "absolute",
                    top: "75%",
                    left: "50%",
                    width: 300,
                    height: 900,
                    objectFit: "contain",
                    transform: curtainStates[i]
                      ? "translate(-50%, calc(-50% - 100vh))"
                      : "translate(-50%, -50%)",
                    transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                    />
              )}
               {color === "#444" && (
                <img
                  src={pepe}
                  alt="Frpo"
                  style={{
                    position: "absolute",
                    top: "80%",
                    left: "50%",
                    width: 300,
                    height: 900,
                    objectFit: "contain",
                    transform: curtainStates[i]
                      ? "translate(-50%, calc(-50% - 100vh))"
                      : "translate(-50%, -50%)",
                    transition: "transform 0.7s cubic-bezier(.7,0,.3,1)",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                    />
              )}
            </div>
          ))}
        </div>
      )}

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
      {/* Colorful squares overlay */}
      <ColorGridOverlay colors={CURTAIN_COLORS} rows={8} cols={16} opacity={0.18} />

      {/* Content */}
      <div
        className="home-content"
        style={{
          position: "relative",
          zIndex: 1,
          filter: !curtainDone ? "blur(2px)" : "none",
          transition: "filter 0.5s",
        }}
      >
        <div className="left">
          <p>Welcome to</p>
          <h1>Just meme it</h1>
        </div>
      </div>
    </div>
  );
};

function ColorGridOverlay({ colors, rows = 8, cols = 16, opacity = 0.18 }) {
  const [offsets, setOffsets] = useState(
    Array.from({ length: rows * cols }, () => ({
      x: 0,
      y: 0,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setOffsets((prev) =>
        prev.map(() => ({
          x: (Math.random() - 0.5) * 12, // random shift between -6px and 6px
          y: (Math.random() - 0.5) * 12,
        }))
      );
    }, 900);
    return () => clearInterval(interval);
  }, [rows, cols]);

  const squares = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const idx = r * cols + c;
      squares.push(
        <div
          key={`${r}-${c}`}
          style={{
            gridRow: r + 1,
            gridColumn: c + 1,
            background: color,
            opacity,
            width: "100%",
            height: "100%",
            transition: "background 0.3s, transform 0.8s cubic-bezier(.7,0,.3,1)",
            transform: `translate(${offsets[idx]?.x || 0}px, ${offsets[idx]?.y || 0}px)`,
            borderRadius: 4,
          }}
        />
      );
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {squares}
    </div>
  );
}

export default Home;
