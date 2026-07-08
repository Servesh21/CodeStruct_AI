import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'inventory_2', label: 'Repos', path: '/dashboard' },
  { icon: 'analytics', label: 'Analysis', path: '/dashboard' },
  { icon: 'history', label: 'History', path: '/dashboard' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

const AppBottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (label: string) => {
    if (label === 'Dashboard' || label === 'Repos') return location.pathname === '/dashboard';
    if (label === 'Analysis') return location.pathname.startsWith('/project');
    if (label === 'Settings') return location.pathname === '/settings';
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface dark:bg-dark-surface-container border-t border-outline-variant dark:border-dark-outline-variant flex justify-around items-center h-[72px] pb-safe">
      {navItems.map((item) => {
        const active = isActive(item.label);
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${
              active
                ? 'text-primary dark:text-dark-primary'
                : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary'
            }`}
          >
            {active ? (
              <div className="bg-primary-container/20 dark:bg-dark-primary-container/20 px-4 py-1 rounded-full">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
              </div>
            ) : (
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
            )}
            <span className={`font-mono text-[10px] leading-none ${active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default AppBottomNav;
