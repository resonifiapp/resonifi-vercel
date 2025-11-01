import React, { useState, useEffect } from 'react';

let showToastGlobal = null;

export function showToast(message, type = 'success') {
  if (showToastGlobal) {
    showToastGlobal(message, type);
  }
}

export default function ToastHost() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    showToastGlobal = (message, type) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    };
    
    return () => {
      showToastGlobal = null;
    };
  }, []);

  if (!toast) return null;

  const bgColor = toast.type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-2 text-white rounded shadow z-50 ${bgColor}`}>
      {toast.message}
    </div>
  );
}