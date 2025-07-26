import React from 'react';
import '../styles/user.css';

const mockProfile = {
  username: "zorak",
  handle: "@zorak.eth",
  address: "0xB8F169300v...4721",
  avatar: "https://i.imgur.com/8Km9tLL.png", // Replace with your avatar URL
  verified: true,
  posts: 12,
  nfts: 3,
  reward: true,
};

const mockUploads = [
  {
    id: 1,
    image: "https://i.imgur.com/8Km9tLL.png",
    from: "@elonmusk",
    caption: "smoke your w...",
  },
  {
    id: 2,
    image: "https://i.imgur.com/8Km9tLL.png",
    from: "@elonmusk",
    caption: "smoke your w...",
  }
  // ...add more as needed
];

const User = () => {
  return (
    <div className="user-page" style={{ display: 'flex', height: '100vh', background: '#222' }}>
      {/* Sidebar would go here if not already globally rendered */}
      <div style={{ flex: 1, background: '#181818', color: '#fff', minWidth: 350, maxWidth: 420, borderRight: '1px solid #444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 340, background: '#222', borderRadius: 12, border: '1px solid #444', padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={mockProfile.avatar} alt="avatar" style={{ width: 180, height: 180, borderRadius: 24, border: '6px solid #111', marginBottom: 16, objectFit: 'cover' }} />
            <div style={{ fontSize: 38, fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: 0 }}>
              {mockProfile.username}
              {mockProfile.verified && <span style={{ color: 'red', fontSize: 22, marginLeft: 8 }}>●</span>}
            </div>
            <div style={{ fontSize: 18, color: '#aaa', marginBottom: 8 }}>{mockProfile.handle}</div>
            <div style={{ background: '#333', borderRadius: 8, padding: '6px 14px', fontSize: 14, color: '#ccc', marginBottom: 12 }}>
              <span role="img" aria-label="wallet" style={{ marginRight: 6 }}>📋</span>
              : {mockProfile.address}
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Updates</div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>Posts: {mockProfile.posts}</div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>NFTs: {mockProfile.nfts}</div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>
              Verification: <input type="checkbox" checked={mockProfile.verified} readOnly style={{ accentColor: 'red' }} />
            </div>
            <div style={{ fontSize: 16, marginBottom: 6 }}>
              <span role="img" aria-label="gift">🎁</span> My Reward
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex: 2, background: '#222', padding: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {mockUploads.map((upload) => (
            <div key={upload.id} style={{ width: 140, background: '#181818', borderRadius: 12, padding: 8, marginBottom: 12 }}>
              <img src={upload.image} alt="upload" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ fontSize: 12, color: '#ccc', marginTop: 6 }}>
                <b>from:</b> {upload.from}<br />
                <b>caption:</b> {upload.caption}
              </div>
            </div>
          ))}
          <div style={{ width: 280, height: 180, background: '#181818', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginLeft: 32, marginTop: 12 }}>
            <div style={{ width: 180, height: 120, background: '#222', borderRadius: 12, marginBottom: 16, border: '1px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              {/* Placeholder for upload preview */}
            </div>
            <button style={{ background: '#b32c2c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 32px', fontSize: 18, cursor: 'pointer' }}>
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;