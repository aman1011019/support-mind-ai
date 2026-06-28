import { useState, useEffect } from 'react';

// Create a simple list of listeners to sync all instances of useDarkMode
const listeners = new Set<(dark: boolean) => void>();

let currentIsDark = (() => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('supportmind_theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
})();

// Apply theme class on load
if (typeof window !== 'undefined') {
  const root = window.document.documentElement;
  if (currentIsDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(currentIsDark);

  useEffect(() => {
    const handleChange = (dark: boolean) => {
      setIsDark(dark);
    };
    listeners.add(handleChange);
    // Sync with the actual initial state
    setIsDark(currentIsDark);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const toggle = () => {
    const nextDark = !currentIsDark;
    currentIsDark = nextDark;
    
    const root = window.document.documentElement;
    if (nextDark) {
      root.classList.add('dark');
      localStorage.setItem('supportmind_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('supportmind_theme', 'light');
    }

    listeners.forEach((listener) => listener(nextDark));
  };

  return { isDark, toggle };
}

