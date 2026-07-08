import React from 'react';
import AppTopBar from './AppTopBar';
import AppSidebar from './AppSidebar';
import AppBottomNav from './AppBottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  onNewScan?: () => void;
  userName?: string;
  userPlan?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  onNewScan,
  userName,
  userPlan,
}) => {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-surface-container-lowest text-on-surface dark:text-dark-on-surface font-sans antialiased">
      <AppTopBar />

      {showSidebar && (
        <AppSidebar onNewScan={onNewScan} userName={userName} userPlan={userPlan} />
      )}

      <main
        className={`pt-16 min-h-screen ${
          showSidebar ? 'md:ml-60' : ''
        }`}
      >
        <div className="max-w-content-wide mx-auto p-margin-mobile md:p-margin-desktop">
          {children}
        </div>
      </main>

      {showSidebar && <AppBottomNav />}
    </div>
  );
};

export default AppLayout;
