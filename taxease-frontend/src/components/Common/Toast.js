import React from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <FiCheckCircle />,
    error: <FiAlertCircle />,
    info: <FiInfo />,
    warning: <FiAlertCircle />
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
};

export default Toast;