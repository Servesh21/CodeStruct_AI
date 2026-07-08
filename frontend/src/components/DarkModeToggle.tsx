import React from 'react';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant transition-colors"
      aria-label="Toggle dark mode"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
