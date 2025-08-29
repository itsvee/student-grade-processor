'use client';

import { useEffect } from 'react';

export default function ForceLight() {
  useEffect(() => {
    // Force light mode by removing dark class if it exists
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Override local storage theme settings
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return null;
}