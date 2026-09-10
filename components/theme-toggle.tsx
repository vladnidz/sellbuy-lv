'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/lib/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-[#8a8a9a] hover:text-[#e8e8ed] transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
