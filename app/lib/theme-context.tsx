'use client';

import { createContext, useContext, useState, useEffect, startTransition, ReactNode, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('sellbuy_theme');
    if (stored === 'dark' || stored === 'light') {
      startTransition(() => setThemeState(stored));
      document.documentElement.classList.toggle('light', stored === 'light');
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('sellbuy_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'dark' as Theme, toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
}
