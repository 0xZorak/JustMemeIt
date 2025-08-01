import React, { useState } from 'react';
import Modal from './Modal';

const MemeVoteModal = ({ open, onClose, meme, onVote }) => {
  const [voteCount, setVoteCount] = useState(1);

  if (!meme) return null;

  const handleIncrement = () => setVoteCount((c) => Math.min(c + 1, 100));
  const handleDecrement = () => setVoteCount((c) => Math.max(c - 1, 1));

  const totalSei = meme.price_in_sei * voteCount;

  const handleVoteClick = () => {
    onVote(voteCount, totalSei);
    setVoteCount(1);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={meme.memeName}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <img src={meme.meme_image} alt={meme.memeName} style={{ width: 180, borderRadius: 12 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Uploader: {meme.uploader}</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Base Price: {meme.price_in_sei} SEI / vote</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button
              style={{
                background: '#222',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 20,
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={handleDecrement}
              disabled={voteCount === 1}
            >-</button>
            <span style={{ fontSize: 20, fontWeight: 600 }}>{voteCount}</span>
            <button
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 20,
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={handleIncrement}
            >+</button>
          </div>
          <div style={{ fontSize: 16, marginBottom: 18 }}>
            Total: <span style={{ color: '#2563eb', fontWeight: 600 }}>{totalSei} SEI</span>
          </div>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 32px',
              fontSize: 18,
              cursor: 'pointer',
              fontWeight: 600,
              marginTop: 8,
            }}
            onClick={handleVoteClick}
          >
            Vote
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MemeVoteModal;