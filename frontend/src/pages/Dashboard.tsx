import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import AnalysisProgressLoader from '../components/AnalysisProgressLoader';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[] | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleImportFromUrl = async (gitUrl: string) => {
    setImportLoading(true);
    try {
      const { data } = await api.post('/analysis/start', { gitUrl });
      if (data?.projectId) {
        setShowImportModal(false);
        navigate(`/project/${data.projectId}`);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to link project');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportFromRepo = async (repo: any) => {
    setImportLoading(true);
    try {
      const { data } = await api.post('/analysis/start', { gitUrl: repo.clone_url });
      if (data?.projectId) {
        setShowImportModal(false);
        navigate(`/project/${data.projectId}`);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to start analysis');
    } finally {
      setImportLoading(false);
    }
  };

  const fetchRepos = async () => {
    if (repos) return;
    try {
      const reposRes = await api.get('/auth/repos');
      setRepos(reposRes.data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load repositories');
    }
  };

  const handleShowImportModal = () => {
    setShowImportModal(true);
    if (!repos) fetchRepos();
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRes = await api.get('/projects');
        setProjects(projectsRes.data);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Compute stats from projects
  const stats = React.useMemo(() => {
    let critical = 0, warnings = 0, suggestions = 0, autoFixed = 0;
    projects.forEach(p => {
      if (p.issueSummary) {
        critical += p.issueSummary.highComplexity || 0;
        warnings += p.issueSummary.duplicateCode || 0;
        suggestions += p.issueSummary.magicNumbers || 0;
        autoFixed += p.issueSummary.total ? Math.floor(p.issueSummary.total * 0.1) : 0;
      }
    });
    return { critical, warnings, suggestions, autoFixed };
  }, [projects]);

  const filteredRepos = repos?.filter(r =>
    !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading your projects...</span>
        </div>
      </div>
    );
  }

  return (
    <AppLayout showSidebar={true} onNewScan={handleShowImportModal} userName={user?.username}>
      {/* ─── Import Modal ─── */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-on-surface/40 dark:bg-dark-surface-container-lowest/80 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />

            {/* Modal body — matches github_connect_repo_selection design */}
            <div className="relative w-full max-w-[640px] flex flex-col gap-lg bg-surface dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl shadow-overlay p-lg animate-scale-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-headline-lg-mobile text-on-surface dark:text-dark-on-surface">Choose a repository to analyze</h2>
                  <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1">Select a repository from your connected account to begin scanning.</p>
                </div>
                <button onClick={() => setShowImportModal(false)} className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface p-2">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* URL import */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const gitUrl = formData.get('gitUrl') as string;
                  if (gitUrl) handleImportFromUrl(gitUrl);
                }}
                className="flex gap-sm"
              >
                <div className="relative flex-1 group input-glow border border-outline-variant dark:border-dark-outline-variant rounded-lg bg-surface-container-lowest dark:bg-dark-surface-container-lowest transition-all flex items-center px-3 py-2">
                  <span className="material-symbols-outlined text-outline dark:text-dark-outline group-focus-within:text-primary dark:group-focus-within:text-dark-primary text-[20px]">link</span>
                  <input
                    name="gitUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    className="w-full bg-transparent border-none focus:ring-0 font-sans text-body-md text-on-surface dark:text-dark-on-surface placeholder:text-outline-variant dark:placeholder:text-dark-outline ml-2 py-1 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={importLoading}
                  className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                >
                  {importLoading ? 'Importing...' : 'Import'}
                </button>
              </form>

              {/* Search repos */}
              <div className="relative w-full group input-glow border border-outline-variant dark:border-dark-outline-variant rounded-lg bg-surface-container-lowest dark:bg-dark-surface-container-lowest transition-all flex items-center px-3 py-2">
                <span className="material-symbols-outlined text-outline dark:text-dark-outline group-focus-within:text-primary dark:group-focus-within:text-dark-primary text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 font-sans text-body-md text-on-surface dark:text-dark-on-surface placeholder:text-outline-variant dark:placeholder:text-dark-outline ml-2 py-1 outline-none"
                />
              </div>

              {/* Repo list */}
              <div className="flex flex-col gap-unit max-h-96 overflow-y-auto">
                {!repos ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-3 text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading repositories...</p>
                  </div>
                ) : filteredRepos && filteredRepos.length > 0 ? (
                  filteredRepos.map((r) => (
                    <div
                      key={r.id}
                      className="repo-row group bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant dark:border-dark-outline-variant rounded-lg p-md flex items-center justify-between cursor-pointer transition-all duration-200 hover:border-primary-container/50 dark:hover:border-dark-primary-container/50 hover:bg-surface-container-low/30 dark:hover:bg-dark-surface-container/30"
                      onClick={() => handleImportFromRepo(r)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-outline-variant dark:text-dark-outline-variant">
                          {r.private ? 'folder' : 'public'}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-body-md font-medium text-on-surface dark:text-dark-on-surface">{r.name}</span>
                            <span className={`font-mono text-label-md px-2 py-0.5 rounded ${
                              r.private
                                ? 'bg-surface-variant dark:bg-dark-surface-variant text-on-surface-variant dark:text-dark-on-surface-variant'
                                : 'bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant'
                            }`}>
                              {r.private ? 'Private' : 'Public'}
                            </span>
                          </div>
                          <span className="font-mono text-label-md text-secondary dark:text-dark-secondary">{r.owner?.login || ''}</span>
                        </div>
                      </div>
                      <div className="min-w-[100px] text-right">
                        <span className="updated-text font-mono text-label-md text-outline dark:text-dark-outline">
                          {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : ''}
                        </span>
                        <span className="hover-action font-mono text-label-md text-primary dark:text-dark-primary font-medium flex items-center justify-end gap-1">
                          Analyze <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">No repositories found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Page Header ─── */}
      <div className="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-md pb-md border-b border-outline-variant dark:border-dark-outline-variant">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface dark:text-dark-on-surface mb-xs">Overview</h1>
          {user && (
            <div className="flex items-center gap-sm font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant bg-surface-container dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant px-sm py-xs rounded w-fit">
              <span className="material-symbols-outlined text-[16px]">code_blocks</span>
              <span>{user.username || user.email || 'workspace'}</span>
            </div>
          )}
        </div>
        <div className="flex gap-sm">
          <button
            onClick={handleShowImportModal}
            className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity flex items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Project
          </button>
        </div>
      </div>

      {/* ─── Error Banner ─── */}
      {error && (
        <div className="mb-lg bg-error-container dark:bg-dark-error-container border border-error dark:border-dark-error rounded-lg px-md py-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-error-container dark:text-dark-on-error-container text-[18px]">error</span>
          <span className="font-sans text-body-md text-on-error-container dark:text-dark-on-error-container">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-on-error-container dark:text-dark-on-error-container">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {[
          { label: 'Critical', value: stats.critical, icon: 'error', color: '#F85149', gradient: 'from-[#F85149]/5' },
          { label: 'Warnings', value: stats.warnings, icon: 'warning', color: '#D29922', gradient: 'from-[#D29922]/5' },
          { label: 'Suggestions', value: stats.suggestions, icon: 'lightbulb', color: '#58A6FF', gradient: 'from-[#58A6FF]/5' },
          { label: 'Auto-fixed', value: stats.autoFixed, icon: 'check_circle', color: '#3FB950', gradient: 'from-[#3FB950]/5' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-lg p-md hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors group cursor-default relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} to-transparent pointer-events-none`}></div>
            <div className="flex items-center justify-between mb-sm relative">
              <span className="font-mono text-label-md text-outline dark:text-dark-outline group-hover:text-on-surface-variant dark:group-hover:text-dark-on-surface-variant transition-colors uppercase tracking-wider">{stat.label}</span>
              <span className="material-symbols-outlined text-[20px]" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <div className="font-heading font-bold text-[32px] text-on-surface dark:text-dark-on-surface relative">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ─── Projects Grid ─── */}
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl">
          <div className="w-14 h-14 bg-surface-container-high dark:bg-dark-surface-container-high rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-surface-variant dark:text-dark-on-surface-variant text-[28px]">inventory_2</span>
          </div>
          <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">No projects yet</h3>
          <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mb-6 max-w-sm mx-auto">Start analyzing your codebase to discover insights and improvements</p>
          <button
            onClick={handleShowImportModal}
            className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-6 py-3 rounded hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} to={`/project/${p.id}`} className="group">
              <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-md hover:border-primary dark:hover:border-dark-primary transition-all duration-200 group-hover:-translate-y-0.5">
                {/* Project header */}
                <div className="flex items-start justify-between mb-md">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface truncate group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">{p.name}</h3>
                    <div className="flex items-center mt-2 gap-sm">
                      <span className="font-mono text-label-md bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-0.5 rounded">{p.language}</span>
                    </div>
                  </div>
                  <span className={`font-mono text-label-md px-2 py-1 rounded ${
                    p.status === 'Completed'
                      ? 'bg-[#3FB950]/15 text-[#3FB950]'
                      : p.status === 'Analyzing'
                        ? 'bg-[#D29922]/15 text-[#D29922]'
                        : 'bg-[#F85149]/15 text-[#F85149]'
                  }`}>
                    {p.status || 'Unknown'}
                  </span>
                </div>

                {/* Progress for analyzing */}
                {p.status === 'Analyzing' && (
                  <div className="mb-md pt-md border-t border-outline-variant dark:border-dark-outline-variant">
                    <AnalysisProgressLoader currentStage={p.analysisStage} compact={true} />
                  </div>
                )}

                {/* Issue summary */}
                {p.status !== 'Analyzing' && p.issueSummary && (
                  <div className="space-y-sm">
                    <div className="flex items-center justify-between py-2 px-3 bg-surface-container dark:bg-dark-surface-container-high rounded-lg">
                      <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Total Issues</span>
                      <span className="font-heading font-bold text-headline-md text-on-surface dark:text-dark-on-surface">{p.issueSummary.total}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-xs">
                      <div className="bg-[#F85149]/10 dark:bg-[#F85149]/15 px-2 py-1.5 rounded text-center">
                        <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Complex</div>
                        <div className="font-heading font-bold text-body-lg text-on-surface dark:text-dark-on-surface">{p.issueSummary.highComplexity}</div>
                      </div>
                      <div className="bg-[#D29922]/10 dark:bg-[#D29922]/15 px-2 py-1.5 rounded text-center">
                        <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Dupes</div>
                        <div className="font-heading font-bold text-body-lg text-on-surface dark:text-dark-on-surface">{p.issueSummary.duplicateCode}</div>
                      </div>
                      <div className="bg-[#58A6FF]/10 dark:bg-[#58A6FF]/15 px-2 py-1.5 rounded text-center">
                        <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Magic #</div>
                        <div className="font-heading font-bold text-body-lg text-on-surface dark:text-dark-on-surface">{p.issueSummary.magicNumbers ?? 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* View details */}
                <div className="mt-md pt-md border-t border-outline-variant dark:border-dark-outline-variant">
                  <div className="flex items-center font-mono text-label-md text-primary dark:text-dark-primary group-hover:text-on-primary-fixed-variant dark:group-hover:text-dark-primary transition-colors">
                    <span>View details</span>
                    <span className="material-symbols-outlined ml-2 text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
