import { useEffect } from 'react';

const ENABLE_SW = false;

export default function PWARegister() {
  useEffect(() => {
    if (!ENABLE_SW) {
      console.log('[PWA] Service Worker disabled for build v2025.10.14-0810');
      return;
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}