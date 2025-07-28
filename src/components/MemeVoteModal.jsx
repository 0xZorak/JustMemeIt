import React from 'react';
import Modal from './Modal';

const MemeVoteModal = ({ open, onClose, meme, onVote }) => {
  if (!meme) return null;
  return (
    <Modal isOpen={open} onClose={onClose} title={meme.meme_name}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <img src={meme.meme_image} alt={meme.meme_name} style={{ width: 180, borderRadius: 12 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Uploader: {meme.uploader}</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>Votes: {meme.price_in_sei} SEI</div>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 32px',
              fontSize: 18,
              cursor: 'pointer',
              marginTop: 16,
              fontWeight: 600,
            }}
            onClick={onVote}
          >
            Vote
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MemeVoteModal;