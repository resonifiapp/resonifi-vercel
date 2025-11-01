import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        // Show "Back online" message briefly
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
    };

    // Check initial state
    if (!navigator.onLine) {
      setIsOffline(true);
      setWasOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return (
    <AnimatePresence>
      {(isOffline || (!isOffline && wasOffline)) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 ${
            isOffline 
              ? 'bg-red-600' 
              : 'bg-green-600'
          } text-white px-4 py-3 text-center text-sm font-medium shadow-lg`}
          style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center justify-center gap-2">
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>No internet connection</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Back online</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}