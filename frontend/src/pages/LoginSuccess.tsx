import React from 'react';

const LoginSuccess: React.FC = () => {
  React.useEffect(() => {
    // Redirect to dashboard after login
    window.location.assign('/dashboard');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
        <span className="font-sans text-body-md text-on-surface dark:text-dark-on-surface">Login successful!</span>
        <p className="font-sans text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
