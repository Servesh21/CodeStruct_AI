import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import EnhancedIssueCard from '../components/EnhancedIssueCard';
import ProjectAnalyticsDashboard from '../components/ProjectAnalyticsDashboard';
import SecurityAnalysisPanel from '../components/SecurityAnalysisPanel';
import EnhancedIssueFilters from '../components/EnhancedIssueFilters';
import BulkAIRefactorViewer from '../components/BulkAIRefactorViewer';
import AcceptedRefactoringsManager from '../components/AcceptedRefactoringsManager';
import AnalysisProgressLoader from '../components/AnalysisProgressLoader';
import { EnhancedIssue, ProjectData } from '../types/analysis';

const Project: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const [analysisAbortController, setAnalysisAbortController] = useState<AbortController | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [ast, setAst] = useState<{ filePath: string; language: string; format: string; ast: string } | null>(null);
  const [astLoading, setAstLoading] = useState(false);
  const [astError, setAstError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'analytics' | 'duplicates' | 'security'>('analytics');

  // Enhanced filtering state
  const [filters, setFilters] = useState({
    issueTypes: [] as string[],
    severities: [] as string[],
    search: '',
    sortBy: 'severity' as 'severity' | 'confidence' | 'type' | 'file',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Bulk refactoring state
  const [showBulkRefactor, setShowBulkRefactor] = useState(false);
  const [showAcceptedRefactorings, setShowAcceptedRefactorings] = useState(false);

  const handleBulkRefactor = async () => {
    if (!data?.issues || filteredAndSortedIssues.length === 0) return;
    setShowBulkRefactor(true);
  };

  const handleAcceptedRefactorings = () => {
    setShowAcceptedRefactorings(true);
  };

  // Filter and sort issues
  const filteredAndSortedIssues = React.useMemo(() => {
    if (!data?.issues) return [];

    let filtered = data.issues.filter((issue: EnhancedIssue) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          issue.filePath.toLowerCase().includes(searchLower) ||
          issue.functionName?.toLowerCase().includes(searchLower) ||
          issue.className?.toLowerCase().includes(searchLower) ||
          issue.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.issueTypes.length > 0 && !filters.issueTypes.includes(issue.issueType)) return false;
      if (filters.severities.length > 0 && !filters.severities.includes(issue.severity)) return false;
      return true;
    });

    filtered.sort((a: EnhancedIssue, b: EnhancedIssue) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'severity':
          const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = severityOrder[b.severity] - severityOrder[a.severity];
          break;
        case 'confidence':
          comparison = b.confidence - a.confidence;
          break;
        case 'type':
          comparison = a.issueType.localeCompare(b.issueType);
          break;
        case 'file':
          comparison = a.filePath.localeCompare(b.filePath);
          break;
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [data?.issues, filters]);

  // Group duplicate issues
  const duplicateGroups = React.useMemo(() => {
    if (!data?.issues) return [];
    const groups = new Map<string, EnhancedIssue[]>();
    data.issues
      .filter((issue: EnhancedIssue) => issue.duplicateGroupId)
      .forEach((issue: EnhancedIssue) => {
        const groupId = issue.duplicateGroupId!;
        if (!groups.has(groupId)) groups.set(groupId, []);
        groups.get(groupId)!.push(issue);
      });
    return Array.from(groups.entries()).map(([id, issues]) => ({
      id,
      issues,
      affectedFiles: Array.from(new Set(issues.map(i => i.filePath))),
      totalInstances: issues.length
    }));
  }, [data?.issues]);

  const filesUnion: string[] = data ? Array.from(new Set([...(data.files || []), ...((data.astFiles as string[]) || [])])) : [];
  const hasAst = (f: string) => (data?.astFiles || []).includes(f);

  // Polling
  const startPolling = async () => {
    if (polling) { clearTimeout(polling); setPolling(null); }

    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setData(data);
        if (data && data.status === 'Analyzing') {
          const timer = setTimeout(fetchDetails, 2000);
          setPolling(timer);
        } else {
          setPolling(null);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load project');
        setPolling(null);
      } finally {
        setLoading(false);
      }
    };

    await fetchDetails();
  };

  const stopAnalysis = async () => {
    try {
      await api.post(`/projects/${projectId}/stop-analysis`);
    } catch (err) {
      console.error('[Stop] Error stopping analysis:', err);
    }
    if (analysisAbortController) analysisAbortController.abort();
    if (polling) { clearTimeout(polling); setPolling(null); }
    setLoading(false);
    setAnalysisAbortController(null);
    setNotification({ message: 'Analysis stopped by user', type: 'info' });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    startPolling();
    return () => { if (polling) clearTimeout(polling); };
  }, [projectId]);

  const loadAst = async (filePath: string) => {
    if (!projectId) return;
    setSelectedFile(filePath);
    setAst(null);
    setAstError(null);
    setAstLoading(true);
    try {
      const encoded = encodeURIComponent(filePath);
      const { data: resp } = await api.get(`/projects/${projectId}/ast/${encoded}`);
      if (resp && !resp.error) setAst(resp);
      else setAstError('AST not found');
    } catch (e: any) {
      setAstError(e?.message ?? 'Failed to load AST');
    } finally {
      setAstLoading(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      const controller = new AbortController();
      setAnalysisAbortController(controller);
      await api.post(`/projects/${projectId}/reanalyze`, {}, { signal: controller.signal });
      setLoading(true);
      setError(null);
      await startPolling();
    } catch (e: any) {
      if (e.name === 'AbortError' || e.name === 'CanceledError') {
        setNotification({ message: 'Re-analysis stopped by user', type: 'info' });
        setTimeout(() => setNotification(null), 5000);
      } else {
        setError(e?.message ?? 'Failed to start re-analysis');
      }
      setLoading(false);
      setAnalysisAbortController(null);
    }
  };

  // --- Status badge helper ---
  const statusBadge = (status: string) => {
    if (status === 'Completed') return 'bg-[#3FB950]/15 text-[#3FB950]';
    if (status === 'Analyzing') return 'bg-[#D29922]/15 text-[#D29922]';
    return 'bg-[#F85149]/15 text-[#F85149]';
  };

  // --- Notification icon ---
  const notifIcon = (type: string) => {
    if (type === 'info') return 'info';
    if (type === 'success') return 'check_circle';
    return 'warning';
  };
  const notifColor = (type: string) => {
    if (type === 'info') return 'text-[#58A6FF] border-[#58A6FF]';
    if (type === 'success') return 'text-[#3FB950] border-[#3FB950]';
    return 'text-[#D29922] border-[#D29922]';
  };

  // --- Tab config ---
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: 'analytics', count: data?.issues?.length || 0 },
    { id: 'issues', label: 'Issues', icon: 'bug_report', count: filteredAndSortedIssues.length },
    { id: 'duplicates', label: 'Duplicates', icon: 'content_copy', count: duplicateGroups.length },
    { id: 'security', label: 'Security', icon: 'shield', count: (data?.issues?.filter(i => ['HardcodedCredentials', 'HardcodedUrls', 'HardcodedSecrets', 'SensitiveFile', 'UnsafeLogging', 'WeakEncryption', 'HardcodedValues'].includes((i as any).issueType)).length) || 0 },
  ] as const;

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading project...</span>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest p-lg">
        <div className="max-w-md w-full bg-error-container dark:bg-dark-error-container/30 border border-error dark:border-dark-error rounded-xl p-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-error dark:text-dark-error text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div>
              <h3 className="font-heading text-headline-md text-on-error-container dark:text-dark-on-error-container mb-1">Error Loading Project</h3>
              <p className="font-sans text-body-md text-on-error-container dark:text-dark-on-error-container">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-surface-container-lowest p-lg">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-outline dark:text-dark-outline block mb-4">sentiment_dissatisfied</span>
          <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">Project Not Found</h3>
          <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout showSidebar={true} userName={user?.username}>
      {/* ── Notification Toast ── */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-scale-in">
          <div className={`bg-surface-container-lowest dark:bg-dark-surface-container border-2 rounded-lg p-md shadow-lg ${notifColor(notification.type)}`}>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{notifIcon(notification.type)}</span>
              <p className="flex-1 font-sans text-body-md text-on-surface dark:text-dark-on-surface">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Header ── */}
      <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg mb-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-sm">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant transition-colors"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>

            {/* Project icon */}
            <div className="w-10 h-10 bg-primary-container dark:bg-dark-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary dark:text-dark-surface-container-lowest text-[20px]">folder</span>
            </div>

            {/* Project info */}
            <div>
              <h1 className="font-heading text-headline-lg text-on-surface dark:text-dark-on-surface">{data?.name}</h1>
              <div className="flex items-center gap-sm mt-1">
                <span className="font-mono text-label-md px-2 py-0.5 rounded bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant">
                  {data?.language}
                </span>
                <span className={`font-mono text-label-md px-2 py-0.5 rounded ${statusBadge(data?.status || '')}`}>
                  {data?.status}
                </span>
                <span className="font-mono text-label-md text-outline dark:text-dark-outline">
                  {data?.issues?.length || 0} issues found
                </span>
              </div>
            </div>
          </div>

          {/* Re-analyze */}
          <button
            onClick={handleReanalyze}
            className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            Re-analyze
          </button>
        </div>
      </div>

      {/* ── Analysis in Progress ── */}
      {data?.status === 'Analyzing' ? (
        <div>
          <AnalysisProgressLoader currentStage={data?.analysisStage} />
          <div className="mt-md flex justify-center">
            <button
              onClick={stopAnalysis}
              className="bg-error dark:bg-dark-error text-on-error dark:text-dark-surface-container-lowest font-mono text-label-md px-lg py-sm rounded hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">stop</span>
              Stop Analysis
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Tab Navigation ── */}
          <div className="mb-lg bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-xs">
            <nav className="flex gap-xs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-[10px] px-md rounded-lg font-mono text-label-md transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest'
                      : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-surface-container-high dark:bg-dark-surface-container-highest text-on-surface-variant dark:text-dark-on-surface-variant'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* ── Content Grid ── */}
          <div className="grid grid-cols-12 gap-lg">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-md">
              {/* Files List */}
              <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-md">
                <div className="flex items-center justify-between mb-sm">
                  <h3 className="font-heading text-body-md font-semibold text-on-surface dark:text-dark-on-surface">Project Files</h3>
                  <span className="font-mono text-label-md px-2 py-0.5 rounded bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant">
                    {filesUnion.length}
                  </span>
                </div>
                <div className="space-y-0.5 max-h-96 overflow-y-auto">
                  {filesUnion.map((f: string) => (
                    <div key={f} className="flex items-center justify-between gap-2 group">
                      <button
                        className={`text-left flex-1 truncate font-mono text-code-md py-1.5 px-2 rounded transition-all ${
                          selectedFile === f
                            ? 'font-semibold text-primary dark:text-dark-primary bg-primary-container/10 dark:bg-dark-primary-container/10'
                            : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                        }`}
                        title={f}
                        onClick={() => hasAst(f) ? loadAst(f) : setSelectedFile(f)}
                      >
                        {f.split('/').pop()}
                      </button>
                      {hasAst(f) && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-tertiary/15 text-tertiary dark:text-dark-tertiary font-bold">
                          AST
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters (only show on issues tab) */}
              {activeTab === 'issues' && data?.issues && (
                <div className="space-y-md">
                  <EnhancedIssueFilters
                    issues={data.issues}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />

                  {/* Action Buttons */}
                  <div className="space-y-sm">
                    {filteredAndSortedIssues.length > 0 && (
                      <button
                        onClick={handleBulkRefactor}
                        className="w-full bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-[10px] rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        AI Fix All ({filteredAndSortedIssues.length})
                      </button>
                    )}
                    <button
                      onClick={handleAcceptedRefactorings}
                      className="w-full bg-[#3FB950] text-white font-mono text-label-md px-md py-[10px] rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">merge</span>
                      Create PR from Accepted Fixes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              {/* Analytics Tab */}
              {activeTab === 'analytics' && data?.issues && (
                <ProjectAnalyticsDashboard issues={data.issues} />
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-md">
                  {projectId && <SecurityAnalysisPanel projectId={Number(projectId)} />}
                </div>
              )}

              {/* Issues Tab */}
              {activeTab === 'issues' && (
                <div className="space-y-md">
                  {filteredAndSortedIssues.length === 0 ? (
                    <div className="text-center py-16 bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl">
                      <span className="material-symbols-outlined text-[48px] text-[#3FB950] block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">
                        {data?.issues?.length === 0 ? 'No Issues Found' : 'No Matching Issues'}
                      </h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">
                        {data?.issues?.length === 0
                          ? 'Great job! Your code is clean.'
                          : 'Try adjusting your filters to see more results.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-1">
                        <span className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
                          Showing {filteredAndSortedIssues.length} of {data?.issues?.length || 0} issues
                        </span>
                      </div>
                      {filteredAndSortedIssues.map((issue: EnhancedIssue) => (
                        <EnhancedIssueCard key={issue.id} issue={issue} />
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Duplicates Tab */}
              {activeTab === 'duplicates' && (
                <div className="space-y-lg">
                  {duplicateGroups.length === 0 ? (
                    <div className="text-center py-16 bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl">
                      <span className="material-symbols-outlined text-[48px] text-[#3FB950] block mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">No Duplicates Found</h3>
                      <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Excellent! Your code has minimal repetition.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between px-1">
                        <span className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
                          Found {duplicateGroups.length} duplicate groups affecting {duplicateGroups.reduce((acc, group) => acc + group.totalInstances, 0)} code blocks
                        </span>
                      </div>
                      {duplicateGroups.map((group, index) => (
                        <div key={group.id} className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg">
                          <div className="flex items-center justify-between mb-md">
                            <h3 className="font-heading text-body-lg font-semibold text-on-surface dark:text-dark-on-surface">
                              Duplicate Group #{index + 1}
                            </h3>
                            <div className="flex items-center gap-sm">
                              <span className="font-mono text-label-md px-2 py-0.5 rounded bg-[#D29922]/15 text-[#D29922]">
                                {group.totalInstances} instances
                              </span>
                              <span className="font-mono text-label-md px-2 py-0.5 rounded bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant">
                                {group.affectedFiles.length} files
                              </span>
                            </div>
                          </div>
                          <div className="space-y-sm">
                            {group.issues.map((issue: EnhancedIssue) => (
                              <EnhancedIssueCard key={issue.id} issue={issue} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* AST Viewer */}
              <div className="mt-lg bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl overflow-hidden">
                <div className="px-md py-sm border-b border-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-dark-on-surface-variant text-[18px]">account_tree</span>
                    <span className="font-heading text-body-md font-semibold text-on-surface dark:text-dark-on-surface">AST Viewer</span>
                  </div>
                  <span className="font-mono text-code-md text-outline dark:text-dark-outline truncate max-w-[60%]" title={selectedFile || ''}>
                    {selectedFile ? selectedFile : 'Select a file with AST badge'}
                  </span>
                </div>
                <div className="p-md">
                  {astLoading && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
                      <span className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading AST…</span>
                    </div>
                  )}
                  {astError && <span className="font-sans text-body-md text-error dark:text-dark-error">{astError}</span>}
                  {!astLoading && !astError && ast && (
                    <div className="space-y-sm">
                      <div className="font-mono text-label-md text-outline dark:text-dark-outline">
                        Language: {ast.language} • Format: {ast.format}
                      </div>
                      <pre className="code-block font-mono text-code-md p-md overflow-auto max-h-96 whitespace-pre-wrap break-words">
                        {ast.ast}
                      </pre>
                    </div>
                  )}
                  {!astLoading && !astError && !ast && (
                    <span className="font-sans text-body-md text-outline dark:text-dark-outline">No AST loaded.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bulk AI Refactoring Viewer */}
          {showBulkRefactor && (
            <BulkAIRefactorViewer
              issues={filteredAndSortedIssues}
              projectId={Number(projectId)}
              onClose={() => setShowBulkRefactor(false)}
              onComplete={async () => {
                const { data: refreshedData } = await api.get(`/projects/${projectId}`);
                setData(refreshedData);
                setShowBulkRefactor(false);
              }}
            />
          )}

          {/* Accepted Refactorings Manager */}
          {showAcceptedRefactorings && (
            <AcceptedRefactoringsManager
              projectId={Number(projectId)}
              onClose={() => setShowAcceptedRefactorings(false)}
            />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default Project;
