import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [statistics, setStatistics] = useState({ projects: 0, issues: 0, refactorings: 0 });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      setDisplayName(data.displayName || data.githubUsername || '');
      setEmail(data.email || '');
      setBio(data.bio || '');
      setStatistics(data.statistics || { projects: 0, issues: 0, refactorings: 0 });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/user/profile', { bio });
      await refreshUser();
      setIsEditing(false);
      alert('Bio updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/user/account');
        alert('Account deleted successfully');
        logout();
        navigate('/');
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete account');
      }
    }
  };

  return (
    <AppLayout showSidebar={true} userName={user?.username}>
      <div className="max-w-4xl space-y-lg">
        {/* Profile Header Card */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-primary-container to-primary dark:from-dark-primary-container dark:to-dark-primary" />

          {/* Profile Info */}
          <div className="px-lg pb-lg">
            <div className="flex items-end justify-between -mt-16 mb-md">
              <div className="flex items-end gap-md">
                <div className="w-[120px] h-[120px] bg-surface dark:bg-dark-surface rounded-xl border-4 border-surface dark:border-dark-surface flex items-center justify-center">
                  <div className="w-[104px] h-[104px] bg-primary-container dark:bg-dark-primary-container rounded-lg flex items-center justify-center text-on-primary dark:text-dark-surface-container-lowest text-4xl font-bold font-heading">
                    {(user?.username || user?.email)?.[0]?.toUpperCase()}
                  </div>
                </div>
                <div className="pb-2">
                  <h2 className="font-heading text-headline-lg text-on-surface dark:text-dark-on-surface">{user?.username || 'User'}</h2>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity"
              >
                {isEditing ? 'Cancel' : 'Edit Bio'}
              </button>
            </div>

            <div className="mt-lg flex items-center gap-2 font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>Connected via GitHub</span>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg">
          <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-md">Profile Information</h3>

          {isEditing ? (
            <div className="space-y-md">
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-2">Display Name</label>
                <input type="text" value={displayName} readOnly disabled
                  className="w-full px-md py-sm bg-surface-container dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant rounded text-outline dark:text-dark-outline cursor-not-allowed font-sans text-body-md"
                />
                <p className="font-mono text-label-md text-outline dark:text-dark-outline mt-1">Display name cannot be changed</p>
              </div>
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-2">Email</label>
                <input type="email" value={email} readOnly disabled
                  className="w-full px-md py-sm bg-surface-container dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant rounded text-outline dark:text-dark-outline cursor-not-allowed font-sans text-body-md"
                />
                <p className="font-mono text-label-md text-outline dark:text-dark-outline mt-1">Email is from your GitHub account</p>
              </div>
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-2">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                  className="w-full px-md py-sm bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant dark:border-dark-outline-variant rounded text-on-surface dark:text-dark-on-surface font-sans text-body-md focus:border-primary dark:focus:border-dark-primary outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end gap-sm pt-md">
                <button onClick={() => setIsEditing(false)} className="font-mono text-label-md px-md py-sm border border-outline-variant dark:border-dark-outline-variant text-on-surface-variant dark:text-dark-on-surface-variant rounded hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors">Cancel</button>
                <button onClick={handleSaveProfile} disabled={saving}
                  className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Bio'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-md">
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-1">Display Name</label>
                <p className="font-sans text-body-lg text-on-surface dark:text-dark-on-surface">{displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-1">Email</label>
                <p className="font-sans text-body-lg text-on-surface dark:text-dark-on-surface">{email}</p>
              </div>
              <div>
                <label className="block font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-1">Bio</label>
                <p className="font-sans text-body-lg text-on-surface dark:text-dark-on-surface">{bio || 'No bio added yet'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg">
          <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-md">Statistics</h3>
          <div className="grid grid-cols-3 gap-md">
            {[
              { label: 'Projects', value: statistics.projects, icon: 'inventory_2' },
              { label: 'Issues Found', value: statistics.issues, icon: 'bug_report' },
              { label: 'Refactorings', value: statistics.refactorings, icon: 'auto_fix_high' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-md bg-surface-container dark:bg-dark-surface-container-high rounded-lg">
                <span className="material-symbols-outlined text-primary dark:text-dark-primary text-[24px] mb-2 block">{stat.icon}</span>
                <div className="font-heading font-bold text-headline-lg text-on-surface dark:text-dark-on-surface">{stat.value}</div>
                <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-error-container dark:bg-dark-error-container/30 border border-error dark:border-dark-error rounded-xl p-lg">
          <h3 className="font-heading text-headline-md text-on-error-container dark:text-dark-on-error-container mb-2">Danger Zone</h3>
          <p className="font-sans text-body-md text-on-error-container dark:text-dark-on-error-container mb-md">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button onClick={handleDeleteAccount}
            className="bg-error dark:bg-dark-error text-on-error dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity"
          >
            Delete Account
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
