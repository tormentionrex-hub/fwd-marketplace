'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference from localStorage or system preference
    const savedTheme = localStorage.getItem('fwd-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fwd-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fwd-theme', 'light');
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="tb-icon" 
      aria-label="Toggle theme"
      title="Alternar Modo Oscuro/Claro"
    >
      {isDark ? (
        // Icono de Sol para cuando está en modo oscuro (y al hacer clic cambia a claro)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="M4.93 4.93l1.41 1.41"></path>
          <path d="M17.66 17.66l1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="M4.93 19.07l1.41-1.41"></path>
          <path d="M17.66 6.34l1.41-1.41"></path>
        </svg>
      ) : (
        // Icono de Luna para cuando está en modo claro (y al hacer clic cambia a oscuro)
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}
