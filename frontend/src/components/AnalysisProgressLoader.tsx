import React, { useEffect, useState } from 'react';

interface AnalysisStage {
    id: string;
    label: string;
    description: string;
    icon: string;
}

const stages: AnalysisStage[] = [
    { id: 'cloning', label: 'Cloning Repository', description: 'Fetching code from Git repository', icon: 'download' },
    { id: 'detecting', label: 'Detecting Language', description: 'Analyzing project structure', icon: 'search' },
    { id: 'parsing', label: 'Parsing Files', description: 'Building Abstract Syntax Trees', icon: 'code' },
    { id: 'analyzing', label: 'Detecting Code Smells', description: 'Scanning for quality issues', icon: 'bug_report' },
    { id: 'duplicates', label: 'Checking Duplicates', description: 'Finding redundant code patterns', icon: 'content_copy' },
    { id: 'completed', label: 'Analysis Complete', description: 'Ready for review', icon: 'check_circle' },
];

interface AnalysisProgressLoaderProps {
    currentStage?: string;
    compact?: boolean;
}

const AnalysisProgressLoader: React.FC<AnalysisProgressLoaderProps> = ({
    currentStage,
    compact = false
}) => {
    const [activeStageIndex, setActiveStageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (currentStage) {
            const index = stages.findIndex(s => s.id === currentStage);
            if (index !== -1) {
                setActiveStageIndex(index);
                setProgress((index / (stages.length - 1)) * 100);
                return;
            }
        }

        const interval = setInterval(() => {
            setActiveStageIndex(prev => {
                const next = prev + 1;
                if (next >= stages.length) {
                    clearInterval(interval);
                    return prev;
                }
                return next;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [currentStage]);

    useEffect(() => {
        setProgress((activeStageIndex / (stages.length - 1)) * 100);
    }, [activeStageIndex]);

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-container dark:border-dark-primary-container border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-label-md text-on-surface-variant dark:text-dark-on-surface-variant">
                    {stages[activeStageIndex]?.label}...
                </span>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container border border-outline-variant dark:border-dark-outline-variant rounded-xl p-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-lg">
                <div>
                    <h3 className="font-heading text-headline-md text-on-surface dark:text-dark-on-surface flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container dark:bg-dark-primary-container rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-primary dark:text-dark-surface-container-lowest text-[20px] animate-spin">autorenew</span>
                        </div>
                        Analysis in Progress
                    </h3>
                    <p className="font-sans text-body-md text-on-surface-variant dark:text-dark-on-surface-variant mt-2">
                        This may take a few minutes for large repositories
                    </p>
                </div>
                <div className="text-right">
                    <div className="font-heading font-bold text-[32px] text-primary dark:text-dark-primary">
                        {Math.round(progress)}%
                    </div>
                    <div className="font-mono text-label-md text-outline dark:text-dark-outline mt-1">Complete</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-surface-container-high dark:bg-dark-surface-container-high rounded-full overflow-hidden mb-lg">
                <div
                    className="absolute inset-y-0 left-0 bg-primary-container dark:bg-dark-primary-container rounded-full progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stages List */}
            <div className="space-y-2">
                {stages.map((stage, index) => {
                    const isActive = index === activeStageIndex;
                    const isCompleted = index < activeStageIndex;

                    return (
                        <div
                            key={stage.id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                                isActive
                                    ? 'bg-primary-container/10 dark:bg-dark-primary-container/10 border border-primary dark:border-dark-primary'
                                    : isCompleted
                                        ? 'bg-[#3FB950]/5 dark:bg-[#3FB950]/10 border border-[#3FB950]/30'
                                        : 'bg-surface-container dark:bg-dark-surface-container-high border border-outline-variant dark:border-dark-outline-variant opacity-50'
                            }`}
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive
                                    ? 'bg-primary-container dark:bg-dark-primary-container text-on-primary dark:text-dark-surface-container-lowest'
                                    : isCompleted
                                        ? 'bg-[#3FB950] text-white'
                                        : 'bg-surface-container-high dark:bg-dark-surface-container-highest text-outline dark:text-dark-outline'
                            }`}>
                                {isCompleted ? (
                                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                ) : isActive ? (
                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse-fast" />
                                ) : (
                                    <span className="font-mono text-label-md">{index + 1}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className={`font-sans text-body-md font-semibold ${
                                        isActive ? 'text-primary dark:text-dark-primary'
                                            : isCompleted ? 'text-[#3FB950]'
                                                : 'text-outline dark:text-dark-outline'
                                    }`}>
                                        {stage.label}
                                    </h4>
                                    {isActive && (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container dark:bg-dark-primary-container opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-dark-primary" />
                                        </span>
                                    )}
                                </div>
                                <p className={`font-mono text-label-md mt-0.5 ${
                                    isActive ? 'text-on-surface-variant dark:text-dark-on-surface-variant'
                                        : isCompleted ? 'text-[#3FB950]/70'
                                            : 'text-outline dark:text-dark-outline'
                                }`}>
                                    {stage.description}
                                </p>
                            </div>

                            {isActive && (
                                <div className="flex-shrink-0">
                                    <div className="w-5 h-5 border-2 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="mt-lg pt-md border-t border-outline-variant dark:border-dark-outline-variant">
                <div className="flex items-center justify-between font-mono text-label-md">
                    <div className="flex items-center gap-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#3FB950] rounded-full" />
                            <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{activeStageIndex} completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-container dark:bg-dark-primary-container rounded-full animate-pulse" />
                            <span className="text-on-surface-variant dark:text-dark-on-surface-variant">1 in progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-outline-variant dark:bg-dark-outline-variant rounded-full" />
                            <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{stages.length - activeStageIndex - 1} pending</span>
                        </div>
                    </div>
                    <span className="text-outline dark:text-dark-outline">Step {activeStageIndex + 1} of {stages.length}</span>
                </div>
            </div>
        </div>
    );
};

export default AnalysisProgressLoader;
