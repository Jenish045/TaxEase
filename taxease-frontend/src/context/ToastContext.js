import React, { createContext, useCallback } from 'react';
import toast from 'react-hot-toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'success') => {
    const options = {
      duration: 4000,
      position: 'top-right'
    };

    switch (type) {
      case 'success':
        return toast.success(message, options);
      case 'error':
        return toast.error(message, options);
      case 'loading':
        return toast.loading(message, options);
      default:
        return toast(message, options);
    }
  }, []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};