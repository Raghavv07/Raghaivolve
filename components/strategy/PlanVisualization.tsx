"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    Download,
    Share2,
    MoreHorizontal,
    LayoutList,
    Kanban,
    AlertTriangle,
    Loader2,
    Trash2,
    Sparkles,
    Zap
} from "lucide-react";
import TaskCard from "./TaskCard";
import { StrategyTask as Task } from "@/lib/megallm";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReplanningModal from "./ReplanningModal";
import TaskStartModal from "./TaskStartModal";
import RiskPanel from "./RiskPanel";
import KanbanBoard from "./KanbanBoard";
import ListView from "./ListView";
import { analyzeRisksAction, replanStrategyAction, acceptPlanAction, getNextBestActionAction, getConfidenceScoreAction, deleteStrategyAction } from "@/app/actions";
import NextActionCard from "./NextActionCard";
import ConfidenceMeter from "./ConfidenceMeter";
import { useRouter } from "next/navigation";
import DecisionTraceabilityMap from "./DecisionTraceabilityMap";
import StrategyHealthMonitor from "./StrategyHealthMonitor";

import ActionConnectorsModal from "./ActionConnectorsModal";

export default function PlanVisualization({ id, initialTasks, initialSummary, initialTitle, initialDuration }: { id: string, initialTasks?: Task[], initialSummary?: string, initialTitle?: string, initialDuration?: string }) {
    console.log(`DEBUG_UI: PlanVisualization init`, { id, taskCount: initialTasks?.length });

    const [showActionConnectors, setShowActionConnectors] = useState(false);
    // ... (rest of state initialization remains the same)

    // Calculate fallback duration if not provided
    const displayDuration = initialDuration || (initialTasks ? `${Math.ceil(initialTasks.length * 2)} days (est)` : "Unknown");

    // ... (rest of component code)

    const [tasks, setTasks] = useState<Task[]>(() => {
        if (!initialTasks) return [];
        return initialTasks.map((t, i) => ({
            ...t,
            id: t.id || `temp-${i}-${Math.random().toString(36).substring(7)}`,
            // Backward compatibility for TaskCard (though TaskCard now supports StrategyTask directly)
            // But types might still be tricky if TaskCard expects 'rationale' but we pass 'why' in DB?
            // Wait, DB has 'rationale'. TaskCard now expects 'rationale' (via StrategyTask).
            // So we just pass it through.
        }));
    });
    const [viewMode, setViewMode] = useState<"timeline" | "kanban" | "list" | "trace">("timeline");
    const [expandedTask, setExpandedTask] = useState<string | null>("2");

    const router = useRouter();

    const handleDeleteStrategy = async () => {
        if (!confirm("Are you sure you want to delete this strategy? This action cannot be undone.")) return;

        try {
            await deleteStrategyAction(id);
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to delete strategy", error);
        }
    };
    const [showReplanningModal, setShowReplanningModal] = useState(false);
    const [isReplanning, setIsReplanning] = useState(false);
    const [proposedPlan, setProposedPlan] = useState<any>(null);
    const [pendingDelay, setPendingDelay] = useState<{ id: string; days: number } | null>(null);

    // Risk Analysis State
    const [showRiskPanel, setShowRiskPanel] = useState(false);
    const [isAnalyzingRisks, setIsAnalyzingRisks] = useState(false);
    const [riskAnalysis, setRiskAnalysis] = useState<{ risks: any[], bottlenecks: string[] }>({ risks: [], bottlenecks: [] });

    // Next Action State
    const [nextAction, setNextAction] = useState<{ taskId: string; reason: string } | null>(null);

    // Confidence State
    const [confidence, setConfidence] = useState<{ score: number; factors: any[] } | null>(null);

    // Start Task Modal State
    const [activeTaskForStart, setActiveTaskForStart] = useState<{ task: Task; index: number } | null>(null);

    useEffect(() => {
        const fetchAIInsights = async () => {
            // Parallel fetch for speed
            const [actionSuggestion, confidenceScore] = await Promise.all([
                getNextBestActionAction(id),
                getConfidenceScoreAction(id)
            ]);

            if (actionSuggestion) setNextAction(actionSuggestion);
            if (confidenceScore) setConfidence(confidenceScore);
        };
        // Initial fetch
        if (initialTasks && initialTasks.length > 0) {
            fetchAIInsights();
        }
    }, [id, initialTasks]);

    const handleReportDelay = async (taskId: string) => {
        setPendingDelay({ id: taskId, days: 3 });
        setIsReplanning(true);
        try {
            // Trigger AI Replanning
            const newPlan = await replanStrategyAction(id, { type: "delay", detail: `Task ${taskId} delayed by 3 days.` });
            setProposedPlan(newPlan);
            setShowReplanningModal(true);
        } catch (error) {
            console.error("Failed to replan:", error);
        } finally {
            setIsReplanning(false);
        }
    };

    const handleAcceptPlan = async () => {
        if (!proposedPlan) return;

        try {
            await acceptPlanAction(id, proposedPlan, "Detailed Replanning due to delay");
            setTasks(proposedPlan.tasks); // Optimistic update
            setProposedPlan(null);
            setShowReplanningModal(false);
            setPendingDelay(null);
        } catch (error) {
            console.error("Failed to accept plan:", error);
        }
    };

    const handleStartTask = (task: Task, index: number) => {
        setActiveTaskForStart({ task, index });
    };

    const handleTaskUpdate = (updatedTask: Task, index: number) => {
        setTasks(prev => {
            const newTasks = [...prev];
            newTasks[index] = updatedTask;
            return newTasks;
        });
    };

    const handleAnalyzeRisks = async () => {
        setIsAnalyzingRisks(true);
        try {
            const analysis = await analyzeRisksAction(id);
            setRiskAnalysis({
                risks: analysis.risks,
                bottlenecks: analysis.bottlenecks
            });

            // Update local tasks with risk info
            setTasks(prev => prev.map((t, i) => {
                const risk = analysis.risks.find((r: any) => r.taskIndex === i);
                if (risk) {
                    return { ...t, riskLevel: risk.riskLevel, riskReason: risk.reason };
                }
                return t;
            }));

            setShowRiskPanel(true);
        } catch (error) {
            console.error("Failed to analyze risks:", error);
        } finally {
            setIsAnalyzingRisks(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <ReplanningModal
                isOpen={showReplanningModal}
                onClose={() => setShowReplanningModal(false)}
                onAccept={handleAcceptPlan}
                delayDays={3}
                impactedTaskCount={proposedPlan ? proposedPlan.tasks.length : 0}
            />

            <AnimatePresence>
                {isReplanning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white">Replanning Strategy...</h3>
                                <p className="text-sm text-muted-foreground">AI is optimizing your timeline and dependencies.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RiskPanel
                isOpen={showRiskPanel}
                onClose={() => setShowRiskPanel(false)}
                risks={riskAnalysis.risks}
                bottlenecks={riskAnalysis.bottlenecks}
            />

            {activeTaskForStart && (
                <TaskStartModal
                    isOpen={!!activeTaskForStart}
                    onClose={() => setActiveTaskForStart(null)}
                    task={activeTaskForStart.task}
                    index={activeTaskForStart.index}
                    strategyId={id}
                    onTaskUpdate={(updated) => handleTaskUpdate(updated, activeTaskForStart.index)}
                />
            )}

            {/* AI Recommendation */}
            {nextAction && (
                <NextActionCard
                    task={tasks.find(t => t.id === nextAction.taskId) || tasks[0]}
                    reason={nextAction.reason}
                    onStart={() => {
                        const taskToStart = tasks.find(t => t.id === nextAction.taskId) || tasks[0];
                        const index = tasks.findIndex(t => t.id === taskToStart.id);
                        if (taskToStart) handleStartTask(taskToStart, index);
                    }}
                />
            )}

            {/* Header / Stats */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{initialTitle || "Strategy Execution Plan"}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    Est. Duration: <span className="text-white font-medium">{displayDuration}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <LayoutList className="w-4 h-4" />
                                    {tasks.length} Tasks
                                </span>
                                {confidence && (
                                    <div className="ml-2 pl-4 border-l border-white/10">
                                        <ConfidenceMeter score={confidence.score} factors={confidence.factors} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <button
                                onClick={handleDeleteStrategy}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>

                            <button
                                onClick={handleAnalyzeRisks}
                                disabled={isAnalyzingRisks}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-sm font-medium text-orange-400 transition-colors"
                            >
                                {isAnalyzingRisks ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                                {isAnalyzingRisks ? "Analyzing..." : "Analyze Risks"}
                            </button>

                            <button
                                onClick={() => setShowActionConnectors(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium text-emerald-400 transition-colors"
                            >
                                <Zap className="w-4 h-4" />
                                Export Actions
                            </button>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    const btn = document.getElementById('share-btn');
                                    if (btn) {
                                        const originalText = btn.innerHTML;
                                        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg> Copied!';
                                        setTimeout(() => {
                                            btn.innerHTML = originalText;
                                        }, 2000);
                                    }
                                }}
                                id="share-btn"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                            <button
                                onClick={() => {
                                    const markdown = `# ${initialTitle || "Strategy Plan"}\n\n${initialSummary || ""}\n\n## Tasks\n\n${tasks.map((t, i) => `${i + 1}. **${t.title}** (${t.estimatedTime})\n   - Priority: ${t.priority}\n   - Status: ${t.status}\n   - Description: ${t.description}\n   - Rationale: ${t.rationale}\n`).join("\n")}`;
                                    const blob = new Blob([markdown], { type: 'text/markdown' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${(initialTitle || "strategy").toLowerCase().replace(/\s+/g, '-')}.md`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium text-white transition-colors shadow-lg shadow-primary/20"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-80">
                        <StrategyHealthMonitor tasks={tasks} risks={riskAnalysis.risks} />
                    </div>
                </div>


            </div>

            {/* Timeline / View Toggle */}
            <div className="w-full overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10 w-fit whitespace-nowrap">
                    <button
                        onClick={() => setViewMode("timeline")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            viewMode === "timeline" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            viewMode === "kanban" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        Kanban
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            viewMode === "list" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode("trace")}
                        className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            viewMode === "trace" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white hover:bg-white/5"
                        )}
                    >
                        Traceability Map
                    </button>
                </div>
            </div>

            {/* Views Content */}
            <div className="relative">
                {viewMode === "kanban" && (
                    <KanbanBoard
                        tasks={tasks}
                        strategyId={id}
                        onStart={handleStartTask}
                        onUpdate={handleTaskUpdate}
                    />
                )}

                {viewMode === "list" && (
                    <ListView
                        tasks={tasks}
                        strategyId={id}
                        onStart={handleStartTask}
                        onUpdate={handleTaskUpdate}
                    />
                )}

                {viewMode === "trace" && (
                    <DecisionTraceabilityMap
                        tasks={tasks}
                        strategyId={id}
                        problemStatement={initialSummary || "Strategy Goal"}
                    />
                )}

                {viewMode === "timeline" && (
                    <div className="relative space-y-4">
                        <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                        <AnimatePresence>
                            {tasks.length > 0 ? (
                                tasks.map((task, index) => (
                                    <div key={task.id} className="relative z-10 pl-14">
                                        <div className={cn(
                                            "absolute left-[21px] top-8 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors duration-300",
                                            task.status === "completed" ? "bg-green-500 border-green-500" :
                                                task.status === "in-progress" ? "bg-blue-500 border-blue-500" :
                                                    "bg-black border-white/20"
                                        )} />

                                        <TaskCard
                                            task={task}
                                            index={index}
                                            strategyId={id}
                                            isExpanded={expandedTask === task.id}
                                            onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                            onDelay={handleReportDelay}
                                            onSkip={(id) => console.log("Skip", id)}
                                            onStart={() => handleStartTask(task, index)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-muted-foreground">
                                    <p>No strategy tasks found.</p>
                                    <p className="text-sm opacity-50 mt-2">Try generating a new strategy.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Action Connectors Modal */}
            <ActionConnectorsModal
                isOpen={showActionConnectors}
                onClose={() => setShowActionConnectors(false)}
                tasks={tasks}
                strategyTitle={initialTitle ?? "Strategy Plan"}
            />
        </div>
    );
}
