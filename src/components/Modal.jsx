import React from 'react';
// import './Modal.css'; // Assuming you have a separate CSS file for modal styles

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>{title}</h2>
        {children}

      </div>
    </div>
  );
};

export default Modal;