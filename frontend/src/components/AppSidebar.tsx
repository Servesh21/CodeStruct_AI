import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AppSidebarProps {
  onNewScan?: () => void;
  userName?: string;
  userPlan?: string;
}

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { icon: 'folder_open', label: 'Repositories', path: '/dashboard' },
  { icon: 'analytics', label: 'Analysis', path: '/dashboard' },
  { icon: 'history', label: 'History', path: '/dashboard' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

const footerItems = [
  { icon: 'help', label: 'Support', path: '#' },
  { icon: 'description', label: 'Documentation', path: '#' },
];

const AppSidebar: React.FC<AppSidebarProps> = ({ onNewScan, userName, userPlan }) => {
  const location = useLocation();

  const isActive = (path: string, label: string) => {
    if (label === 'Dashboard' || label === 'Repositories') return location.pathname === '/dashboard';
    if (label === 'Analysis') return location.pathname.startsWith('/project');
    if (label === 'Settings') return location.pathname === '/settings';
    return location.pathname === path;
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-60 flex-col pt-md bg-surface dark:bg-dark-surface-container border-r border-outline-variant dark:border-dark-outline-variant z-40">
      {/* User chip */}
      <div className="px-md mb-md">
        <div className="flex items-center gap-sm mb-xs">
          <div className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-dark-surface-container-highest border border-outline-variant dark:border-dark-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface dark:text-dark-on-surface text-[18px]">person</span>
          </div>
          <div>
            <h2 className="font-mono text-label-md font-bold text-on-surface dark:text-dark-on-surface">{userName || 'CodeStruct.AI'}</h2>
            <p className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">{userPlan || 'Developer'}</p>
          </div>
        </div>
      </div>

      {/* New Scan button */}
      {onNewScan && (
        <div className="px-md mb-lg">
          <button
            onClick={onNewScan}
            className="w-full flex items-center justify-center gap-2 bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface dark:text-dark-on-surface py-2 rounded-md border border-outline-variant dark:border-dark-outline-variant hover:bg-surface-variant dark:hover:bg-dark-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="font-mono text-label-md">New Scan</span>
          </button>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 flex flex-col gap-[2px] px-sm">
        {navItems.map((item) => {
          const active = isActive(item.path, item.label);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-md py-[10px] rounded-r border-l-[3px] transition-all duration-150 font-mono text-label-md ${
                active
                  ? 'border-l-primary dark:border-l-dark-primary bg-primary-container/10 dark:bg-dark-primary-container/10 text-primary dark:text-dark-primary font-bold'
                  : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="mt-auto pb-md flex flex-col gap-[2px] px-sm border-t border-outline-variant dark:border-dark-outline-variant pt-sm">
        {footerItems.map((item) => (
          <a
            key={item.label}
            href={item.path}
            className="flex items-center gap-3 px-md py-2 border-l-[3px] border-transparent text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-all duration-150 font-mono text-label-md rounded-r"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
};

export default AppSidebar;
