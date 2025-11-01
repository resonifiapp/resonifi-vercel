import React from 'react';

export function ToastComponent({ message, type = 'success' }) {
  if (!message) return null;
  
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 text-white rounded shadow z-50 ${bgColor}`}>
      {message}
    </div>
  );
}

export default ToastComponent;