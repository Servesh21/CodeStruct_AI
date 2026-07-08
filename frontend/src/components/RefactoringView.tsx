import React, { useState } from 'react';
import { api } from '../lib/api';
import ReactDiffViewer from 'react-diff-viewer-continued';

type ValidationLayer = {
  passed: boolean;
  message?: string;
};

type ValidationResult = {
  isVerified: boolean;
  confidence: number;
  validationLayers: {
    syntactic: ValidationLayer;
    signature: ValidationLayer;
    structural: ValidationLayer;
    behavioral: ValidationLayer;
  };
  verificationBadge: 'verified' | 'warning' | 'failed';
};

type RefactoringSuggestion = {
  id: string;
  description: string;
  suggestedCode: string;
  confidence: number;
  isVerified?: boolean;
  verificationBadge?: string;
  validationResult?: ValidationResult;
};

type Props = {
  issue: any;
};

const RefactoringView: React.FC<Props> = ({ issue }) => {
  const [suggestion, setSuggestion] = useState<RefactoringSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/issues/${issue.id}/ai-refactor`);
      if (data.success) {
        setSuggestion(data.data);
      } else {
        setError(data.message || 'Failed to generate refactoring suggestion');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (suggestionId: string) => {
    setActionLoading('accept');
    try {
      const { data } = await api.post(`/issues/${issue.id}/ai-refactor/accept`);
      if (data.success) {
        alert('Refactoring accepted! You can now include it in a bulk PR operation.');
      } else {
        setError(data.message || 'Failed to accept refactoring');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (suggestionId: string) => {
    setActionLoading('reject');
    try {
      const { data } = await api.post(`/issues/${issue.id}/ai-refactor/reject`);
      if (data.success) {
        alert('Refactoring rejected.');
        setSuggestion(null);
      } else {
        setError(data.message || 'Failed to reject refactoring');
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const getVerificationBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'verified': return 'bg-[#3FB950]/15 text-[#3FB950]';
      case 'warning': return 'bg-[#D29922]/15 text-[#D29922]';
      case 'failed': return 'bg-[#F85149]/15 text-[#F85149]';
      default: return 'bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant';
    }
  };

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'verified': return 'check_circle';
      case 'warning': return 'warning';
      case 'failed': return 'cancel';
      default: return 'help';
    }
  };

  const getLayerIcon = (passed: boolean) => passed ? 'check_circle' : 'cancel';

  return (
    <div className="border border-outline-variant dark:border-dark-outline-variant rounded-lg p-md bg-surface-container-lowest dark:bg-dark-surface-container">
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-heading text-body-lg font-semibold text-on-surface dark:text-dark-on-surface">AI Refactoring Suggestion</h3>
        <button
          className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-3 py-1.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Generate AI Fix'}
        </button>
      </div>

      {error && (
        <div className="bg-error-container dark:bg-dark-error-container border border-error dark:border-dark-error rounded-lg p-sm mb-md">
          <span className="font-sans text-body-md text-on-error-container dark:text-dark-on-error-container">{error}</span>
        </div>
      )}

      {suggestion && (
        <div className="space-y-md">
          {/* Validation Status */}
          <div className="bg-surface-container dark:bg-dark-surface-container-high rounded-lg p-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-heading text-body-md font-medium text-on-surface dark:text-dark-on-surface">RefactoringMirror Validation</h4>
              {suggestion.validationResult && (
                <div className={`px-2 py-0.5 rounded font-mono text-label-md flex items-center gap-1 ${getVerificationBadgeStyle(suggestion.validationResult.verificationBadge)}`}>
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{getVerificationIcon(suggestion.validationResult.verificationBadge)}</span>
                  {suggestion.validationResult.verificationBadge.toUpperCase()}
                </div>
              )}
            </div>

            {suggestion.validationResult && (
              <>
                <div className="mb-2">
                  <span className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">Confidence: </span>
                  <span className={`font-mono text-label-md ${suggestion.validationResult.confidence >= 80 ? 'text-[#3FB950]' : suggestion.validationResult.confidence >= 60 ? 'text-[#D29922]' : 'text-[#F85149]'}`}>
                    {suggestion.validationResult.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-xs font-mono text-label-md">
                  {(['syntactic', 'signature', 'structural', 'behavioral'] as const).map(layer => (
                    <div key={layer} className="flex items-center gap-2 text-on-surface-variant dark:text-dark-on-surface-variant">
                      <span className={`material-symbols-outlined text-[14px] ${suggestion.validationResult!.validationLayers[layer].passed ? 'text-[#3FB950]' : 'text-[#F85149]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                        {getLayerIcon(suggestion.validationResult!.validationLayers[layer].passed)}
                      </span>
                      <span className="capitalize">{layer}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Description */}
          {suggestion.description && (
            <div className="bg-primary-container/10 dark:bg-dark-primary-container/10 border-l-[3px] border-primary dark:border-dark-primary rounded-r-lg p-md">
              <h4 className="font-heading text-body-md font-medium text-on-surface dark:text-dark-on-surface mb-1">Description</h4>
              <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">{suggestion.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-sm">
            <button
              onClick={() => handleAccept(suggestion.id)}
              disabled={actionLoading !== null}
              className="bg-[#3FB950] text-white font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              {actionLoading === 'accept' ? 'Accepting...' : 'Accept Refactoring'}
            </button>
            <button
              onClick={() => handleReject(suggestion.id)}
              disabled={actionLoading !== null}
              className="bg-[#F85149] text-white font-mono text-label-md px-md py-sm rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Refactoring'}
            </button>
          </div>

          {/* Code Diff */}
          <ReactDiffViewer
            oldValue={issue.codeBlock}
            newValue={suggestion.suggestedCode}
            splitView={true}
            leftTitle="Original Code"
            rightTitle="Suggested Code"
          />
        </div>
      )}
    </div>
  );
};

export default RefactoringView;
