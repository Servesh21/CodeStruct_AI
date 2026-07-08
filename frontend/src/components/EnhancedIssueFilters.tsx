import React from 'react';
import { EnhancedIssue } from '../types/analysis';

interface FilterState {
    issueTypes: string[];
    severities: string[];
    search: string;
    sortBy: 'severity' | 'confidence' | 'type' | 'file';
    sortOrder: 'asc' | 'desc';
}

interface Props {
    issues: EnhancedIssue[];
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
}

const allIssueTypes = [
    'LongMethod', 'GodClass', 'DeepNesting', 'LongParameterList',
    'HighComplexity', 'CognitiveComplexity', 'DuplicateCode',
    'MagicNumber', 'DeadCode', 'FeatureEnvy'
];

const allSeverities = ['Critical', 'High', 'Medium', 'Low'];

const severityColors: Record<string, string> = {
    Critical: 'bg-[#F85149]/15 text-[#F85149]',
    High: 'bg-[#D29922]/15 text-[#D29922]',
    Medium: 'bg-[#58A6FF]/15 text-[#58A6FF]',
    Low: 'bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant',
};

const severityActiveColors: Record<string, string> = {
    Critical: 'bg-[#F85149] text-white',
    High: 'bg-[#D29922] text-white',
    Medium: 'bg-[#58A6FF] text-white',
    Low: 'bg-on-surface-variant dark:bg-dark-on-surface-variant text-surface dark:text-dark-surface',
};

const EnhancedIssueFilters: React.FC<Props> = ({ issues, filters, onFiltersChange }) => {
    const issueTypeCounts = React.useMemo(() => {
        return allIssueTypes.reduce((acc, type) => {
            acc[type] = issues.filter(issue => issue.issueType === type).length;
            return acc;
        }, {} as Record<string, number>);
    }, [issues]);

    const severityCounts = React.useMemo(() => {
        return allSeverities.reduce((acc, severity) => {
            acc[severity] = issues.filter(issue => issue.severity === severity).length;
            return acc;
        }, {} as Record<string, number>);
    }, [issues]);

    const handleIssueTypeToggle = (type: string) => {
        const newTypes = filters.issueTypes.includes(type)
            ? filters.issueTypes.filter(t => t !== type)
            : [...filters.issueTypes, type];
        onFiltersChange({ ...filters, issueTypes: newTypes });
    };

    const handleSeverityToggle = (severity: string) => {
        const newSeverities = filters.severities.includes(severity)
            ? filters.severities.filter(s => s !== severity)
            : [...filters.severities, severity];
        onFiltersChange({ ...filters, severities: newSeverities });
    };

    const resetFilters = () => {
        onFiltersChange({ issueTypes: [], severities: [], search: '', sortBy: 'severity', sortOrder: 'desc' });
    };

    const activeFiltersCount = filters.issueTypes.length + filters.severities.length + (filters.search ? 1 : 0);

    return (
        <div className="space-y-md bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-lg p-md">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-heading text-body-md font-semibold text-on-surface dark:text-dark-on-surface">
                    Filters & Sorting
                </h3>
                {activeFiltersCount > 0 && (
                    <button onClick={resetFilters} className="font-mono text-label-md text-primary dark:text-dark-primary hover:underline">
                        Clear all ({activeFiltersCount})
                    </button>
                )}
            </div>

            {/* Search */}
            <div>
                <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-1">Search in files/functions</label>
                <div className="input-glow border border-outline-variant dark:border-dark-outline-variant rounded bg-surface-container-lowest dark:bg-dark-surface-container-lowest transition-all flex items-center px-3 py-2">
                    <span className="material-symbols-outlined text-outline dark:text-dark-outline text-[18px]">search</span>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                        placeholder="Search..."
                        className="w-full bg-transparent border-none focus:ring-0 font-sans text-body-md text-on-surface dark:text-dark-on-surface placeholder:text-outline-variant dark:placeholder:text-dark-outline ml-2 outline-none"
                    />
                </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-sm">
                <div>
                    <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-1">Sort by</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
                        className="w-full font-sans text-body-md px-3 py-2 border border-outline-variant dark:border-dark-outline-variant rounded bg-surface-container-lowest dark:bg-dark-surface-container-lowest text-on-surface dark:text-dark-on-surface outline-none focus:border-primary dark:focus:border-dark-primary"
                    >
                        <option value="severity">Severity</option>
                        <option value="confidence">Confidence</option>
                        <option value="type">Issue Type</option>
                        <option value="file">File Path</option>
                    </select>
                </div>
                <div>
                    <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-1">Order</label>
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => onFiltersChange({ ...filters, sortOrder: e.target.value as any })}
                        className="w-full font-sans text-body-md px-3 py-2 border border-outline-variant dark:border-dark-outline-variant rounded bg-surface-container-lowest dark:bg-dark-surface-container-lowest text-on-surface dark:text-dark-on-surface outline-none focus:border-primary dark:focus:border-dark-primary"
                    >
                        <option value="desc">High to Low</option>
                        <option value="asc">Low to High</option>
                    </select>
                </div>
            </div>

            {/* Severity Filters */}
            <div>
                <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-2">Severity Levels</label>
                <div className="flex flex-wrap gap-xs">
                    {allSeverities.map(severity => {
                        const count = severityCounts[severity];
                        const isSelected = filters.severities.includes(severity);
                        return (
                            <button
                                key={severity}
                                onClick={() => handleSeverityToggle(severity)}
                                disabled={count === 0}
                                className={`font-mono text-label-md px-3 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                    isSelected ? severityActiveColors[severity] : severityColors[severity]
                                }`}
                            >
                                {severity} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Issue Type Filters */}
            <div>
                <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-2">Issue Types</label>
                <div className="grid grid-cols-2 gap-xs">
                    {allIssueTypes.map(type => {
                        const count = issueTypeCounts[type];
                        const isSelected = filters.issueTypes.includes(type);
                        return (
                            <button
                                key={type}
                                onClick={() => handleIssueTypeToggle(type)}
                                disabled={count === 0}
                                className={`font-mono text-label-md px-3 py-1.5 rounded transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed ${
                                    isSelected
                                        ? 'bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest'
                                        : 'bg-surface-container dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-highest'
                                }`}
                            >
                                <div className="truncate">{type}</div>
                                <div className={`text-[10px] ${isSelected ? 'opacity-70' : 'text-outline dark:text-dark-outline'}`}>
                                    {count} issues
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Quick Filters */}
            <div className="border-t border-outline-variant dark:border-dark-outline-variant pt-sm">
                <label className="font-mono text-label-md text-outline dark:text-dark-outline block mb-2">Quick Filters</label>
                <div className="flex flex-wrap gap-xs">
                    <button
                        onClick={() => onFiltersChange({ ...filters, severities: ['Critical', 'High'] })}
                        className="font-mono text-label-md px-3 py-1 bg-[#F85149]/10 text-[#F85149] rounded hover:bg-[#F85149]/20 transition-colors"
                    >
                        High Priority
                    </button>
                    <button
                        onClick={() => onFiltersChange({ ...filters, issueTypes: ['DuplicateCode'] })}
                        className="font-mono text-label-md px-3 py-1 bg-[#58A6FF]/10 text-[#58A6FF] rounded hover:bg-[#58A6FF]/20 transition-colors"
                    >
                        Duplicates
                    </button>
                    <button
                        onClick={() => onFiltersChange({ ...filters, issueTypes: ['HighComplexity', 'CognitiveComplexity'] })}
                        className="font-mono text-label-md px-3 py-1 bg-[#D29922]/10 text-[#D29922] rounded hover:bg-[#D29922]/20 transition-colors"
                    >
                        Complexity
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedIssueFilters;