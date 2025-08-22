import React, { useEffect } from 'react';
import { useModal } from '../context/ModalContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { setModalOpen } = useModal();

  useEffect(() => {
    setModalOpen(isOpen);
    return () => setModalOpen(false);
  }, [isOpen, setModalOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#222",
          borderRadius: 16,
          padding: 32,
          minWidth: 340,
          maxWidth: 420,
          boxShadow: "0 2px 24px #0008",
        }}
      >
        <span className="close-modal" onClick={onClose} style={{cursor: "pointer", position: "absolute", top: 16, right: 24, fontSize: 28}}>&times;</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;