import React from 'react';
import Header from '../components/Header';

const Assets = () => (
  <div style={{ width: '100%', height: '100%' }}>
    <Header />
    <div className="page-scroll-area">
      <h1>Assets</h1>
      <p>Here you can manage your assets.</p>
      {/* Additional content related to assets can be added here */}
    </div>
  </div>
);

export default Assets;