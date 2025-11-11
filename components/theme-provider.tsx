'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    let initialTheme: Theme = 'light';
    if (stored === 'dark' || stored === 'light') {
      initialTheme = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initialTheme = 'dark';
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme, isReady]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
