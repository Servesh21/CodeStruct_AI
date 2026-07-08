import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CodeStructLogo from './CodeStructLogo';

const AppTopBar: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface dark:bg-dark-surface-container-low border-b border-outline-variant dark:border-dark-outline-variant">
      {/* Left: Logo + nav links */}
      <div className="flex items-center gap-xl">
        <Link to="/" className="flex items-center">
          <CodeStructLogo size="sm" />
        </Link>
        <div className="hidden md:flex items-center gap-lg ml-xl">
          <a href="#" className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary transition-colors duration-200">Docs</a>
          <a href="#" className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary transition-colors duration-200">Benchmarks</a>
          <a href="#" className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary transition-colors duration-200">Pricing</a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-md">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {isAuthenticated ? (
          <>
            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-sm px-sm py-xs bg-surface-container dark:bg-dark-surface-container-high rounded-lg border border-outline-variant dark:border-dark-outline-variant">
              <div className="w-7 h-7 rounded-full bg-primary-container dark:bg-dark-primary-container flex items-center justify-center text-on-primary dark:text-dark-on-primary text-xs font-bold">
                {(user?.username || user?.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="font-mono text-label-md text-on-surface dark:text-dark-on-surface">{user?.username || 'User'}</span>
            </div>

            <Link
              to="/dashboard"
              className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity flex items-center gap-sm"
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface transition-colors px-sm py-xs"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={login}
            className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            Connect GitHub
          </button>
        )}

        {/* Mobile menu button */}
        <button className="md:hidden text-on-surface dark:text-dark-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </nav>
  );
};

export default AppTopBar;
