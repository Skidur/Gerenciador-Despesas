import React, { useState, useEffect } from 'react';
import './ConfirmationPopup.css';

const ConfirmationPopup = ({ isOpen, onClose, onConfirm, message }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    onConfirm();
  };

  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose();
        setIsClosing(false); 
      }, 300); 
      return () => clearTimeout(timer); 
    }
  }, [isClosing, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`popup ${isClosing ? 'closing' : ''}`}>
        <p>{message}</p>
        <div className="popup-buttons">
          <button onClick={handleConfirm}>Confirmar</button>
          <button onClick={handleClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;