import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Vote from './pages/Vote';
import Rank from './pages/Rank';
import Assets from './pages/Assets';
import User from './pages/User';
import './styles/styles.css';

function App() {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    document.body.className = lightMode ? 'light-mode' : '';
  }, [lightMode]);

  const toggleMode = () => setLightMode((prev) => !prev);


  return (
    <Router>
      <div className="app-container">
        <Sidebar lightMode={lightMode} toggleMode={toggleMode} />
        <div className="main-content">
          <Routes>
            
{/* <Home lightMode={lightMode} /> */}
            <Route path="/" element={<Home />} />
            <Route path="/vote" element={<Vote lightMode={lightMode} />} />
            <Route path="/rank" element={<Rank />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;