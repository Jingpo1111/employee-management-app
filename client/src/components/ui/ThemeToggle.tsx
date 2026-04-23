import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:bg-border/40"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
}