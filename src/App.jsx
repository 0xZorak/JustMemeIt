import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ModalProvider } from './context/ModalContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Rank from './pages/Rank';
import Assets from './pages/Assets';
import User from './pages/User';
import { FaDesktop } from 'react-icons/fa'; 
import MemeAI from './pages/MemeAI';
import './styles/styles.css';

function App() {
  const [lightMode, setLightMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.body.className = lightMode ? 'light-mode' : '';
  }, [lightMode]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMode = () => setLightMode((prev) => !prev);

  if (isMobile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#222',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
        }}
      >
        <div
          style={{
            background: '#181828',
            borderRadius: 16,
            padding: '40px 32px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 340,
          }}
        >
          <FaDesktop size={48} color="#2563eb" style={{ marginBottom: 20 }} />
          <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10 }}>
            Please switch to desktop view
          </div>
          <div style={{ fontSize: 16, color: '#aaa' }}>
            This app is best experienced on a larger screen.
          </div>
        </div>
      </div>
    );
  }

  return (
    <ModalProvider>
      <Router>
        <div className="app-container">
          <Sidebar lightMode={lightMode} toggleMode={toggleMode} />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vote" element={<Vote lightMode={lightMode} />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/user" element={<User />} />
              <Route path="/memeai" element={<MemeAI />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ModalProvider>
  );
}

export default App;