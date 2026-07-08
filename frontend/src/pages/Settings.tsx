import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import AppLayout from '../components/AppLayout';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'advanced'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [showComplexityWarnings, setShowComplexityWarnings] = useState(true);
  const [complexityThreshold, setComplexityThreshold] = useState(3);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/user/settings');
      setAutoAnalysis(data.autoAnalysis ?? true);
      setShowComplexityWarnings(data.showComplexityWarnings ?? true);
      setComplexityThreshold(data.complexityThreshold ?? 3);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/user/settings', { autoAnalysis, showComplexityWarnings, complexityThreshold });
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'advanced', label: 'Advanced', icon: 'tune' },
  ] as const;

  return (
    <AppLayout showSidebar={true} userName={user?.username}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-sm">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-md py-[10px] rounded-lg text-left transition-colors font-mono text-label-md ${
                    activeSection === section.id
                      ? 'bg-primary-container/10 dark:bg-dark-primary-container/10 text-primary dark:text-dark-primary font-bold'
                      : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={activeSection === section.id ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-lg">
                <div>
                  <h2 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-1">General Settings</h2>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Manage your general preferences</p>
                </div>

                <div className="space-y-md">
                  {/* Auto Analysis */}
                  <div className="flex items-center justify-between py-md border-b border-outline-variant dark:border-dark-outline-variant">
                    <div>
                      <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">Auto-start Analysis</h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Automatically start analysis when importing a project</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={autoAnalysis} onChange={(e) => setAutoAnalysis(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-outline-variant dark:bg-dark-outline-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 dark:peer-focus:ring-dark-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container dark:peer-checked:bg-dark-primary-container"></div>
                    </label>
                  </div>

                  {/* Show Complexity Warnings */}
                  <div className="flex items-center justify-between py-md border-b border-outline-variant dark:border-dark-outline-variant">
                    <div>
                      <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">Complexity Warnings</h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Show warnings for high complexity code</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={showComplexityWarnings} onChange={(e) => setShowComplexityWarnings(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-outline-variant dark:bg-dark-outline-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 dark:peer-focus:ring-dark-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container dark:peer-checked:bg-dark-primary-container"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-lg">
                <div>
                  <h2 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-1">Notification Settings</h2>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Control how you receive notifications</p>
                </div>

                <div className="bg-primary-container/10 dark:bg-dark-primary-container/10 border-l-[3px] border-primary dark:border-dark-primary rounded-r-lg p-md">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary dark:text-dark-primary text-[20px] mt-0.5">info</span>
                    <div>
                      <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">GitHub OAuth Authentication</h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                        Since you're signed in via GitHub, email notifications are not available. In-app notifications will be shown instead.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-md border-b border-outline-variant dark:border-dark-outline-variant">
                  <div>
                    <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">In-App Notifications</h3>
                    <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Show notifications when analysis completes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-label-md text-[#3FB950]">Always On</span>
                    <span className="material-symbols-outlined text-[#3FB950] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {activeSection === 'advanced' && (
              <div className="space-y-lg">
                <div>
                  <h2 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-1">Advanced Settings</h2>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Configure advanced analysis options</p>
                </div>

                <div className="bg-primary-container/10 dark:bg-dark-primary-container/10 border-l-[3px] border-primary dark:border-dark-primary rounded-r-lg p-md">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary dark:text-dark-primary text-[20px] mt-0.5">info</span>
                    <div>
                      <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">What is Cyclomatic Complexity?</h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                        Complexity measures how many independent paths exist through your code. More if/else/for/while statements = higher complexity.
                      </p>
                      <div className="mt-2 space-y-1 font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
                        <p>• <strong>Lower threshold (1-3):</strong> Catch all complex code, more warnings</p>
                        <p>• <strong>Medium threshold (4-6):</strong> Balance between strictness and practicality</p>
                        <p>• <strong>Higher threshold (7-10):</strong> Only flag very complex code, fewer warnings</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-md border-b border-outline-variant dark:border-dark-outline-variant">
                  <div className="mb-md">
                    <h3 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">Complexity Threshold</h3>
                    <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Flag functions with cyclomatic complexity equal to or above this value</p>
                  </div>
                  <div className="space-y-sm">
                    <div className="flex items-center gap-md">
                      <input
                        type="range" min="1" max="10" value={complexityThreshold}
                        onChange={(e) => setComplexityThreshold(Number(e.target.value))}
                        className="flex-1 h-2 bg-surface-container-high dark:bg-dark-surface-container-high rounded-full appearance-none cursor-pointer accent-primary-container dark:accent-dark-primary-container"
                      />
                      <span className="font-heading font-bold text-headline-md text-primary dark:text-dark-primary w-12 text-center">{complexityThreshold}</span>
                    </div>
                    <div className="flex justify-between font-mono text-label-md text-outline dark:text-dark-outline">
                      <span>Strict</span>
                      <span>Balanced</span>
                      <span>Lenient</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container dark:bg-dark-surface-container-high rounded-lg p-md">
                  <h4 className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface mb-2">Current Setting Impact</h4>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">
                    {complexityThreshold <= 3 && "Very strict - will flag most functions with conditional logic."}
                    {complexityThreshold > 3 && complexityThreshold <= 6 && "Balanced - flags moderately complex functions. Recommended."}
                    {complexityThreshold > 6 && "Lenient - only flags highly complex functions."}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-lg pt-lg border-t border-outline-variant dark:border-dark-outline-variant flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-6 py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
