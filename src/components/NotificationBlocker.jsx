import { useEffect } from 'react';

export default function NotificationBlocker() {
  useEffect(() => {
    // Override Notification.requestPermission to always return denied
    if ('Notification' in window) {
      const original = Notification.requestPermission;
      Notification.requestPermission = function() {
        console.log('Notification request BLOCKED');
        return Promise.resolve('denied');
      };
      
      // Clean up
      return () => {
        Notification.requestPermission = original;
      };
    }
  }, []);

  return null;
}