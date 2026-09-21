import { useState, useEffect } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('immy_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved as ThemeMode;
      }
    } catch (e) {
      console.warn('Failed to read theme mode from localStorage:', e);
    }
    return 'system'; // Default to System Auto Detect
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const resolvedTheme = themeMode === 'system' ? (systemIsDark ? 'dark' : 'light') : themeMode;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initial sync
    setSystemIsDark(mediaQuery.matches);

    // Event listener for OS/system theme changes
    const handleSystemChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    try {
      mediaQuery.addEventListener('change', handleSystemChange);
    } catch {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemChange);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleSystemChange);
      } catch {
        mediaQuery.removeListener(handleSystemChange);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const metaTheme = document.querySelector('meta[name="theme-color"]');

    if (resolvedTheme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      if (metaTheme) metaTheme.setAttribute('content', '#0d0f14');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
  }, [resolvedTheme]);

  const changeTheme = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    try {
      localStorage.setItem('immy_theme_mode', newMode);
    } catch (e) {
      console.warn('Failed to save theme mode to localStorage:', e);
    }
  };

  return {
    themeMode,
    resolvedTheme,
    systemIsDark,
    changeTheme,
  };
}
