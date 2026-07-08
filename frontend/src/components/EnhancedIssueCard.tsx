import React, { useState } from 'react';
import { EnhancedIssue } from '../types/analysis';
import AIRefactorViewer from './AIRefactorViewer';

interface Props {
    issue: EnhancedIssue;
    onRefactorAccept?: () => void;
}

const severityConfig: Record<string, { bg: string; text: string; icon: string }> = {
    Critical: { bg: 'bg-[#F85149]/15', text: 'text-[#F85149]', icon: 'error' },
    High: { bg: 'bg-[#D29922]/15', text: 'text-[#D29922]', icon: 'warning' },
    Medium: { bg: 'bg-[#58A6FF]/15', text: 'text-[#58A6FF]', icon: 'info' },
    Low: { bg: 'bg-surface-container-high dark:bg-dark-surface-container-high', text: 'text-on-surface-variant dark:text-dark-on-surface-variant', icon: 'lightbulb' },
};

const EnhancedIssueCard: React.FC<Props> = ({ issue, onRefactorAccept }) => {
    const [showAIRefactor, setShowAIRefactor] = useState(false);

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-[#3FB950]';
        if (confidence >= 75) return 'text-[#D29922]';
        return 'text-[#F85149]';
    };

    const formatMetrics = (metadata: Record<string, any>) => {
        if (!metadata) return [];
        const metrics = [];
        if (metadata.complexity !== undefined) metrics.push(`Complexity: ${metadata.complexity}`);
        if (metadata.cyclomaticComplexity !== undefined) metrics.push(`Cyclomatic: ${metadata.cyclomaticComplexity}`);
        if (metadata.cognitiveComplexity !== undefined) metrics.push(`Cognitive: ${metadata.cognitiveComplexity}`);
        if (metadata.codeLines !== undefined) metrics.push(`Lines: ${metadata.codeLines}`);
        if (metadata.parameterCount !== undefined) metrics.push(`Parameters: ${metadata.parameterCount}`);
        if (metadata.maxNesting !== undefined) metrics.push(`Nesting: ${metadata.maxNesting}`);
        if (metadata.duplicates !== undefined) metrics.push(`Duplicates: ${metadata.duplicates}`);
        if (metadata.similarity !== undefined) metrics.push(`Similarity: ${Math.round(metadata.similarity * 100)}%`);
        return metrics;
    };

    const metrics = formatMetrics(issue.metadata || {});
    const sev = severityConfig[issue.severity] || severityConfig.Low;

    return (
        <div className="border border-outline-variant dark:border-dark-outline-variant rounded-lg p-md bg-surface-container-lowest dark:bg-dark-surface-container space-y-3 hover:border-primary/30 dark:hover:border-dark-primary/30 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-label-md px-2 py-0.5 rounded bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant">
                        {issue.issueType}
                    </span>
                    <span className={`font-mono text-label-md px-2 py-0.5 rounded flex items-center gap-1 ${sev.bg} ${sev.text}`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{sev.icon}</span>
                        {issue.severity}
                    </span>
                    <span className={`font-mono text-label-md ${getConfidenceColor(issue.confidence)}`}>
                        {issue.confidence}%
                    </span>
                </div>
                <div className="font-mono text-code-md text-outline dark:text-dark-outline">
                    {issue.filePath}
                    {issue.lineStart && issue.lineEnd && (
                        <span className="ml-1">:{issue.lineStart}-{issue.lineEnd}</span>
                    )}
                </div>
            </div>

            {/* Function/Class Info */}
            {(issue.functionName || issue.className) && (
                <div className="flex items-center gap-3 font-mono text-code-md">
                    {issue.className && (
                        <span className="text-primary dark:text-dark-primary">Class: {issue.className}</span>
                    )}
                    {issue.functionName && (
                        <span className="text-tertiary dark:text-dark-tertiary">fn: {issue.functionName}</span>
                    )}
                </div>
            )}

            {/* Description */}
            {issue.description && (
                <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">
                    {issue.description}
                </p>
            )}

            {/* Metrics */}
            {metrics.length > 0 && (
                <div className="flex flex-wrap gap-xs">
                    {metrics.map((metric, index) => (
                        <span key={index} className="font-mono text-label-md px-2 py-0.5 bg-surface-container dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant rounded">
                            {metric}
                        </span>
                    ))}
                </div>
            )}

            {/* Recommendation */}
            {issue.recommendation && (
                <div className="p-3 bg-primary-container/10 dark:bg-dark-primary-container/10 border-l-[3px] border-primary dark:border-dark-primary rounded-r-lg">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="font-mono text-label-md text-primary dark:text-dark-primary mb-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                                Recommendation
                            </div>
                            <div className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant">
                                {issue.recommendation}
                            </div>
                        </div>
                        {issue.issueType !== 'LongMethod' && (
                            <button
                                onClick={() => setShowAIRefactor(true)}
                                className="bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest font-mono text-label-md px-3 py-1.5 rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
                                title="Generate AI-powered refactoring suggestion"
                            >
                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                AI Fix
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Code Block Preview */}
            <div className="code-block">
                <div className="px-3 py-2 border-b border-outline-variant/20 flex items-center justify-between">
                    <span className="font-mono text-label-md text-surface-variant">Code Block</span>
                    <button
                        className="font-mono text-label-md px-2 py-0.5 bg-surface-container-high/20 hover:bg-surface-container-high/30 text-surface-variant rounded transition-colors"
                        onClick={() => navigator.clipboard.writeText(issue.codeBlock)}
                        title="Copy code to clipboard"
                    >
                        Copy
                    </button>
                </div>
                <pre className="font-mono text-code-md p-3 overflow-auto max-h-32 text-surface-dim whitespace-pre-wrap">
                    {issue.codeBlock}
                </pre>
            </div>

            {/* AI Refactor Viewer Modal */}
            {showAIRefactor && (
                <AIRefactorViewer
                    issueId={issue.id}
                    issueType={issue.issueType}
                    originalCode={issue.codeBlock}
                    onClose={() => setShowAIRefactor(false)}
                    onAccept={() => {
                        setShowAIRefactor(false);
                        if (onRefactorAccept) onRefactorAccept();
                    }}
                />
            )}
        </div>
    );
};

export default EnhancedIssueCard;