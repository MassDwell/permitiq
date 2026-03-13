'use client';
import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Record last sync time on page load (when online)
    if (navigator.onLine) {
      localStorage.setItem('ml-last-sync', new Date().toISOString());
    }

    // Update last sync when coming back online
    const handleOnline = () => {
      localStorage.setItem('ml-last-sync', new Date().toISOString());
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  return null;
}
