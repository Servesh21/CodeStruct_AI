import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CodeStructLogo from '../components/CodeStructLogo';

const Landing: React.FC = () => {
  const [me, setMe] = useState<{ authenticated: boolean; user?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();

  const startLogin = () => {
    const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
    const loginUrl = `${apiBaseURL}/auth/login`;
    window.location.href = loginUrl;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setMe(data);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load session');
      }
    };
    load();
  }, []);

  if (!me && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading your session...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="w-14 h-14 bg-error-container dark:bg-dark-error-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-error-container dark:text-dark-on-error-container text-[28px]">warning</span>
          </div>
          <h2 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface">Connection Error</h2>
          <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-surface-container-lowest font-sans antialiased flex flex-col">
      {/* ─── Top Navigation ─── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface dark:bg-dark-surface-container-low border-b border-outline-variant dark:border-dark-outline-variant">
        <div className="flex items-center gap-6">
          <Link to="/">
            <CodeStructLogo size="sm" />
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="font-mono text-label-md text-on-surface dark:text-dark-on-surface hover:text-primary dark:hover:text-dark-primary transition-colors duration-200">Docs</a>
          {me.authenticated ? (
            <Link
              to="/dashboard"
              className="font-mono text-label-md text-on-surface dark:text-dark-on-surface hover:text-primary dark:hover:text-dark-primary transition-colors duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <a href="#" className="font-mono text-label-md text-on-surface dark:text-dark-on-surface hover:text-primary dark:hover:text-dark-primary transition-colors duration-200">Sign in</a>
          )}

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

          {me.authenticated ? (
            <Link
              to="/dashboard"
              className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={startLogin}
              className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Connect GitHub
            </button>
          )}
        </div>

        {/* Mobile menu */}
        <button className="md:hidden text-on-surface dark:text-dark-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="flex-grow pt-24 pb-16 flex flex-col items-center w-full hero-pattern">
        {/* Hero Section */}
        <div className="max-w-content w-full px-lg mx-auto grid md:grid-cols-2 gap-12 items-center mb-24">
          {/* Hero Text */}
          <div className="flex flex-col gap-6 animate-slide-up">
            <span className="font-mono text-label-md text-primary dark:text-dark-primary tracking-widest uppercase">AI Code Review & Auto-Fix</span>
            <h1 className="font-heading text-display-lg text-on-surface dark:text-dark-on-surface">
              Your repo reviewed.<br />Issues found.<br />Fixes ready.
            </h1>
            <p className="font-sans text-body-lg text-on-surface-variant dark:text-dark-on-surface-variant max-w-md">
              Connect your GitHub repo and let CodeStruct find bugs, bad patterns, and security issues — then fix them.
            </p>
            <div className="mt-4">
              {me.authenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-6 py-3 rounded flex items-center gap-3 hover:opacity-90 transition-opacity w-fit"
                >
                  Go to Dashboard
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              ) : (
                <button
                  onClick={startLogin}
                  className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-6 py-3 rounded flex items-center gap-3 hover:opacity-90 transition-opacity w-fit"
                >
                  <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Connect GitHub
                </button>
              )}
            </div>
          </div>

          {/* Hero Visual — Glass code preview mockup */}
          <div className="relative w-full h-[400px] flex items-center justify-center animate-fade-in">
            <div className="glass-panel w-full max-w-lg rounded-xl shadow-overlay p-1 overflow-hidden flex flex-col">
              {/* Window chrome */}
              <div className="h-8 border-b border-outline-variant dark:border-dark-outline-variant flex items-center px-3 gap-2 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-t-xl">
                <div className="w-3 h-3 rounded-full bg-error dark:bg-dark-error"></div>
                <div className="w-3 h-3 rounded-full bg-surface-variant dark:bg-dark-surface-variant"></div>
                <div className="w-3 h-3 rounded-full bg-surface-variant dark:bg-dark-surface-variant"></div>
                <div className="flex-grow flex justify-center">
                  <span className="font-mono text-code-md text-on-surface-variant dark:text-dark-on-surface-variant">src/auth/service.ts</span>
                </div>
              </div>

              {/* Code content */}
              <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest flex-grow p-4 font-mono text-code-md flex flex-col gap-3">
                {/* Issue 1 — Critical */}
                <div className="flex items-start gap-3 border border-outline-variant dark:border-dark-outline-variant p-3 rounded">
                  <span className="material-symbols-outlined text-error dark:text-dark-error text-[16px] mt-1">warning</span>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-on-surface dark:text-dark-on-surface font-semibold text-body-md">SQL Injection Risk</span>
                      <span className="bg-error-container dark:bg-dark-error-container text-on-error-container dark:text-dark-on-error-container text-[10px] px-2 py-0.5 rounded font-mono">High</span>
                    </div>
                    <span className="text-on-surface-variant dark:text-dark-on-surface-variant block text-xs">Unsanitized input in query building.</span>
                    <div className="mt-2 bg-[#0F1117] text-surface dark:text-dark-on-surface p-2 rounded text-[11px] overflow-hidden whitespace-nowrap">
                      <span className="text-error dark:text-dark-error">- const query = `SELECT * FROM users WHERE id = {'$'}{'{'}id{'}'}`;</span><br />
                      <span className="text-primary-fixed-dim dark:text-dark-primary">+ const query = 'SELECT * FROM users WHERE id = $1';</span>
                    </div>
                  </div>
                </div>

                {/* Issue 2 — Low */}
                <div className="flex items-start gap-3 border border-outline-variant dark:border-dark-outline-variant p-3 rounded opacity-70">
                  <span className="material-symbols-outlined text-primary dark:text-dark-primary text-[16px] mt-1">info</span>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-on-surface dark:text-dark-on-surface font-semibold text-body-md">Dead Code</span>
                      <span className="bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant text-[10px] px-2 py-0.5 rounded font-mono">Low</span>
                    </div>
                    <span className="text-on-surface-variant dark:text-dark-on-surface-variant block text-xs">Variable 'tempCache' is declared but never read.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── How It Works Strip ─── */}
        <div className="w-full max-w-content px-lg mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'folder', step: 'Step 1', title: 'Connect GitHub', desc: 'Authorize read access to your repositories securely.' },
              { icon: 'check_circle', step: 'Step 2', title: 'Select a repo', desc: 'Pick the project you want to scan for vulnerabilities and style issues.' },
              { icon: 'lock', step: 'Step 3', title: 'Review & fix', desc: 'Review AI-generated suggestions and merge auto-fixes with one click.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4 items-start p-6 bg-surface dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-lg hover:border-primary dark:hover:border-dark-primary transition-colors">
                <div className="w-10 h-10 rounded bg-primary-container/10 dark:bg-dark-primary-container/10 flex items-center justify-center text-primary dark:text-dark-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <div className="font-mono text-label-md text-primary dark:text-dark-primary mb-1">{item.step}</div>
                  <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">{item.title}</h3>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Social Proof Strip ─── */}
        <div className="w-full bg-surface dark:bg-dark-surface-container border-y border-outline-variant dark:border-dark-outline-variant py-12">
          <div className="max-w-content mx-auto px-lg flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="font-heading text-display-lg text-on-surface dark:text-dark-on-surface">47K+</div>
              <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mt-2 uppercase tracking-wider">Issues Found</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-outline-variant dark:bg-dark-outline-variant"></div>
            <div className="text-center">
              <div className="font-heading text-display-lg text-primary dark:text-dark-primary">12K+</div>
              <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mt-2 uppercase tracking-wider">Auto-Fixed</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-outline-variant dark:bg-dark-outline-variant"></div>
            <div className="text-center">
              <div className="font-heading text-display-lg text-on-surface dark:text-dark-on-surface">99%</div>
              <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mt-2 uppercase tracking-wider">Accuracy</div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full border-t border-outline-variant dark:border-dark-outline-variant bg-surface dark:bg-dark-surface-container py-6 px-lg flex justify-center items-center">
        <span className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Built by Servesh Khade</span>
      </footer>
    </div>
  );
};

export default Landing;
