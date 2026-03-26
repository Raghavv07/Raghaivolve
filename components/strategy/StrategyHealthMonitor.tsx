
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, AlertOctagon } from 'lucide-react';
import { StrategyTask } from '@/lib/megallm';

interface StrategyHealthMonitorProps {
    tasks: StrategyTask[];
    risks: { taskIndex: number; riskLevel: "high" | "medium" | "low" }[];
}

export default function StrategyHealthMonitor({ tasks, risks }: StrategyHealthMonitorProps) {
    // 1. Calculate Health Score
    const calculateHealth = (): { score: number; penalties: string[] } => {
        if (tasks.length === 0) return { score: 100, penalties: [] };

        let score = 100;
        const penalties: string[] = [];

        // Factor 1: High Risk Tasks
        const highRiskCount = risks.filter(r => r.riskLevel === "high").length;
        if (highRiskCount > 0) {
            const pen = highRiskCount * 10;
            score -= pen;
            penalties.push(`-${pen} for ${highRiskCount} High Risk Tasks`);
        }

        // Factor 2: Dependency Complexity
        const totalDependencies = tasks.reduce((acc, t) => acc + (t.dependencies?.length || 0), 0);
        const avgDeps = totalDependencies / tasks.length;
        if (avgDeps > 2) {
            score -= 15;
            penalties.push("-15 for High Dependency Density");
        }

        // Factor 3: Completion Rate (optimistic bonus or penalty)
        const completed = tasks.filter(t => t.status === 'completed').length;
        const progress = completed / tasks.length;
        if (progress > 0.5) score += 5; // Momentum bonus

        return { score: Math.max(0, Math.min(100, score)), penalties };
    };

    const { score, penalties } = calculateHealth();

    // Determine Status Color
    const getStatusColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 50) return "text-yellow-500";
        return "text-red-500";
    };

    const getStatusLabel = (s: number) => {
        if (s >= 80) return "Healthy";
        if (s >= 50) return "At Risk";
        return "Critical";
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Strategy Health
                </h3>
                <div className={`text-lg font-bold ${getStatusColor(score)}`}>
                    {score}/100
                </div>
            </div>

            {/* Health Meter */}
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>

            {/* Status & Alerts */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${getStatusColor(score)}`}>
                        {getStatusLabel(score)}
                    </span>
                </div>

                {penalties.length > 0 ? (
                    <div className="space-y-1">
                        {penalties.map((pen, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 p-1.5 rounded">
                                <AlertOctagon className="w-3 h-3" />
                                {pen}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/5 p-1.5 rounded">
                        <CheckCircle className="w-3 h-3" />
                        All systems nominal
                    </div>
                )}
            </div>

            {/* Recommendation */}
            {score < 80 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-xs text-muted-foreground flex gap-2">
                        <TrendingUp className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                        {score < 50
                            ? "Immediate Action: Break down high-risk tasks and resolve bottlenecks."
                            : "Suggestion: Review dependencies to simplify execution flow."}
                    </p>
                </div>
            )}
        </div>
    );
}
