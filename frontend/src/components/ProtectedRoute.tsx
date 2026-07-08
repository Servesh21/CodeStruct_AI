import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give AuthContext time to check authentication
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Wait 2 seconds for auth check

    return () => clearTimeout(timer);
  }, []);

  // Show loading while checking authentication
  if (isLoading && user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Checking authentication...</span>
          <p className="font-sans text-label-md text-outline dark:text-dark-outline max-w-md text-center">
            Verifying your login status
          </p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
