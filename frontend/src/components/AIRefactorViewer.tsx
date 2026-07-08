import React, { useState } from 'react';
import { api } from '../lib/api';

interface AIRefactorViewerProps {
  issueId: number;
  issueType: string;
  originalCode: string;
  onClose: () => void;
  onAccept?: () => void;
}

const AIRefactorViewer: React.FC<AIRefactorViewerProps> = ({
  issueId,
  issueType,
  originalCode,
  onClose,
  onAccept,
}) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState<'diff' | 'original' | 'refactored'>('diff');

  React.useEffect(() => {
    fetchSuggestion();
  }, [issueId]);

  const fetchSuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/issues/${issueId}/ai-refactor`);
      if (data.success && data.data) {
        setSuggestion(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRefactoring = async () => {
    setGenerating(true);
    setError(null);
    const controller = new AbortController();
    setAbortController(controller);
    try {
      const { data } = await api.post(`/issues/${issueId}/ai-refactor`, {}, { signal: controller.signal });
      if (data.success) {
        setSuggestion(data.data);
      } else {
        setError(data.message || 'Failed to generate refactoring');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Generation was stopped by user');
      } else {
        setError(err.response?.data?.message || 'Failed to generate refactoring suggestion');
      }
    } finally {
      setGenerating(false);
      setAbortController(null);
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setGenerating(false);
      setAbortController(null);
      setError('Generation stopped by user');
    }
  };

  const handleAccept = async () => {
    try {
      await api.post(`/issues/${issueId}/ai-refactor/accept`);
      if (onAccept) onAccept();
      onClose();
    } catch (err: any) {
      setError('Failed to accept suggestion');
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/issues/${issueId}/ai-refactor/reject`);
      onClose();
    } catch (err: any) {
      setError('Failed to reject suggestion');
    }
  };

  const renderDiff = () => {
    if (!suggestion) return null;
    const originalLines = suggestion.originalCode.split('\n');
    const refactoredLines = suggestion.refactoredCode.split('\n');

    return (
      <div className="grid grid-cols-2 gap-md">
        {/* Original Code */}
        <div>
          <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-[#F85149] rounded-full" />
            Original Code
          </div>
          <pre className="font-mono text-code-md bg-[#0F1117] rounded-lg p-md overflow-x-auto">
            {originalLines.map((line: string, i: number) => {
              const isChanged = suggestion.changes.some((c: any) => c.lineNumber === i + 1 && c.type !== 'add');
              return (
                <div key={i} className={isChanged ? 'bg-[#F85149]/15 border-l-2 border-[#F85149] pl-2' : ''}>
                  <span className="text-outline-variant dark:text-dark-outline-variant mr-4 select-none">{i + 1}</span>
                  <span className="text-surface-dim">{line}</span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Refactored Code */}
        <div>
          <div className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-[#3FB950] rounded-full" />
            Refactored Code
          </div>
          <pre className="font-mono text-code-md bg-[#0F1117] rounded-lg p-md overflow-x-auto">
            {refactoredLines.map((line: string, i: number) => {
              const change = suggestion.changes.find((c: any) => c.lineNumber === i + 1);
              const isChanged = !!change;
              const isAdded = change?.type === 'add';
              return (
                <div key={i} className={isAdded ? 'bg-[#3FB950]/15 border-l-2 border-[#3FB950] pl-2' : isChanged ? 'bg-[#D29922]/15 border-l-2 border-[#D29922] pl-2' : ''}>
                  <span className="text-outline-variant dark:text-dark-outline-variant mr-4 select-none">{i + 1}</span>
                  <span className="text-surface-dim">{line}</span>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-on-surface/40 dark:bg-dark-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-lg border-b border-outline-variant dark:border-dark-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary dark:text-dark-primary">auto_fix_high</span>
                AI-Powered Refactoring
              </h2>
              <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                Issue Type: <span className="font-semibold">{issueType}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface p-2 hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high rounded-lg transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-lg">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">Loading suggestion...</span>
            </div>
          )}

          {error && (
            <div className="bg-error-container dark:bg-dark-error-container border border-error dark:border-dark-error rounded-lg p-md mb-md">
              <p className="font-sans text-body-md text-on-error-container dark:text-dark-on-error-container">{error}</p>
            </div>
          )}

          {!loading && !suggestion && !generating && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[48px] text-outline dark:text-dark-outline mb-4 block">auto_fix_high</span>
              <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">No AI Suggestion Yet</h3>
              <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mb-6">Generate an AI-powered refactoring suggestion for this code issue</p>
              <button
                onClick={generateRefactoring}
                className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-6 py-3 rounded hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Generate AI Refactoring
              </button>
            </div>
          )}

          {generating && (
            <div className="text-center py-12">
              <div className="w-14 h-14 border-[3px] border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface mb-2">AI is Thinking...</h3>
              <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mb-6">Analyzing your code and generating refactoring suggestions</p>
              <button
                onClick={stopGeneration}
                className="bg-error dark:bg-dark-error text-on-error dark:text-dark-surface-container-lowest font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">stop</span>
                Stop Generation
              </button>
            </div>
          )}

          {suggestion && (
            <div className="space-y-lg">
              {/* Explanation */}
              <div className="bg-primary-container/10 dark:bg-dark-primary-container/10 border-l-[3px] border-primary dark:border-dark-primary rounded-r-lg p-md">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary dark:text-dark-primary">lightbulb</span>
                  <div className="flex-1">
                    <h3 className="font-heading text-body-lg font-semibold text-on-surface dark:text-dark-on-surface mb-2">AI Explanation</h3>
                    <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">{suggestion.explanation}</p>
                    <div className="mt-3 flex items-center gap-lg font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
                      <span>Confidence: <strong className="text-on-surface dark:text-dark-on-surface">{suggestion.confidence}%</strong></span>
                      <span>Changes: <strong className="text-on-surface dark:text-dark-on-surface">{suggestion.changes.length} lines</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-outline-variant dark:border-dark-outline-variant">
                <nav className="flex gap-lg">
                  {[
                    { id: 'diff', label: 'Side-by-Side Diff', icon: 'compare_arrows' },
                    { id: 'original', label: 'Original Code', icon: 'code' },
                    { id: 'refactored', label: 'Refactored Code', icon: 'auto_fix_high' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-mono text-label-md transition-colors flex items-center gap-1 ${
                        activeTab === tab.id
                          ? 'border-primary dark:border-dark-primary text-primary dark:text-dark-primary'
                          : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Code Display */}
              <div className="mt-md">
                {activeTab === 'diff' && renderDiff()}
                {activeTab === 'original' && (
                  <pre className="font-mono text-code-md bg-[#0F1117] rounded-lg p-md overflow-x-auto">
                    <code className="text-surface-dim">{suggestion.originalCode}</code>
                  </pre>
                )}
                {activeTab === 'refactored' && (
                  <pre className="font-mono text-code-md bg-[#0F1117] rounded-lg p-md overflow-x-auto">
                    <code className="text-surface-dim">{suggestion.refactoredCode}</code>
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {suggestion && (
          <div className="p-lg border-t border-outline-variant dark:border-dark-outline-variant bg-surface-container dark:bg-dark-surface-container-high">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReject}
                className="font-mono text-label-md px-6 py-2 border border-outline-variant dark:border-dark-outline-variant text-on-surface-variant dark:text-dark-on-surface-variant rounded hover:bg-surface-container-high dark:hover:bg-dark-surface-container-highest transition-colors"
              >
                Reject
              </button>
              <div className="flex gap-sm">
                <button
                  onClick={generateRefactoring}
                  disabled={generating}
                  className="font-mono text-label-md px-6 py-2 border border-primary dark:border-dark-primary text-primary dark:text-dark-primary rounded hover:bg-primary-container/10 dark:hover:bg-dark-primary-container/10 transition-colors disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleAccept}
                  className="bg-[#3FB950] text-white font-mono text-label-md px-6 py-2 rounded hover:opacity-90 transition-opacity"
                >
                  Accept & Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRefactorViewer;
