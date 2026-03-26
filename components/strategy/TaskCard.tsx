"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Circle,
    ChevronDown,
    Clock,
    AlertCircle,
    ArrowRight,
    GitBranch,
    MoreHorizontal,
    Loader2,
    Sparkles,
    CheckSquare,
    Square,
    Lightbulb,
    X,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTaskStatusAction, refineTaskAction, explainTaskAction } from "@/app/actions";
import { StrategyTask as Task } from "@/lib/megallm";

interface TaskCardProps {
    task: Task;
    strategyId: string;
    isExpanded: boolean;
    onToggle: () => void;
    index: number;
    onDelay?: (id: string) => void;
    onSkip?: (id: string) => void;
    onStart?: () => void;
}

const priorityColors = {
    high: "text-red-400 bg-red-400/10 border-red-400/20",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    low: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function TaskCard({ task: initialTask, strategyId, isExpanded, onToggle, index, onDelay, onSkip, onStart }: TaskCardProps) {
    const [task, setTask] = useState(initialTask);
    const [isRefining, setIsRefining] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        setTask(initialTask);
    }, [initialTask]);

    const handleStart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onStart) {
            onStart();
        }
    };

    const handleRefine = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isRefining) return;
        setIsRefining(true);
        try {
            const refinedTask = await refineTaskAction(strategyId, index);
            if (refinedTask) {
                setTask(prev => ({
                    ...prev,
                    ...refinedTask,
                    status: (refinedTask.status || prev.status) as "pending" | "in-progress" | "completed"
                }));
            }
        } catch (error) {
            console.error("Failed to refine task:", error);
        } finally {
            setIsRefining(false);
        }
    };

    const handleExplain = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // If we already have it, just show it
        if (task.aiReasoning) {
            setShowExplanation(true);
            return;
        }

        setIsExplaining(true);
        try {
            const updatedTask = await explainTaskAction(strategyId, index);
            if (updatedTask) {
                setTask(prev => ({
                    ...prev,
                    aiReasoning: updatedTask.aiReasoning
                }));
                setShowExplanation(true);
            }
        } catch (error) {
            console.error("Failed to explain task:", error);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleToggleSubStep = async (stepIndex: number) => {
        // Optimistic update
        setTask(prev => {
            if (!prev.subSteps) return prev;
            const newSteps = [...prev.subSteps];
            newSteps[stepIndex] = {
                ...newSteps[stepIndex],
                isCompleted: !newSteps[stepIndex].isCompleted
            };
            return { ...prev, subSteps: newSteps };
        });

        try {
            // Import action dynamically to avoid build cycle issues if any, or just standard import
            const { toggleSubStepAction } = await import("@/app/actions");
            await toggleSubStepAction(strategyId, index, stepIndex);
        } catch (error) {
            console.error("Failed to toggle step:", error);
            // Revert on error
            setTask(initialTask);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                    "group relative border rounded-2xl overflow-hidden transition-all duration-300",
                    isExpanded
                        ? "bg-white/10 border-primary/30 shadow-lg ring-1 ring-primary/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                )}
            >
                {/* Status Line */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300",
                    task.status === "completed" ? "bg-green-500" :
                        task.status === "in-progress" ? "bg-blue-500" : "bg-transparent"
                )} />

                <div className="flex">
                    <div
                        onClick={onToggle}
                        className="flex-1 p-4 flex items-start gap-4 cursor-pointer select-none"
                    >
                        <div className="mt-1">
                            {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : task.status === "in-progress" ? (
                                <Circle className="w-5 h-5 text-blue-500 animate-pulse" />
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className={cn(
                                    "font-semibold text-lg transition-colors",
                                    task.status === "completed" ? "text-muted-foreground line-through" : "text-white"
                                )}>
                                    {task.title}
                                </h3>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider border",
                                    priorityColors[task.priority]
                                )}>
                                    {task.priority}
                                </div>
                                {task.riskLevel === 'high' && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border border-red-500/20 bg-red-500/10 text-red-400 animate-pulse">
                                        <AlertTriangle className="w-3 h-3" />
                                        High Risk
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedTime}
                                </span>
                                {task.dependencies && task.dependencies.length > 0 && (
                                    <span className="flex items-center gap-1 text-orange-400/80">
                                        <GitBranch className="w-3 h-3" />
                                        Depends on {task.dependencies.join(", ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Menu Trigger */}
                    <div className="p-4 pl-0 flex items-start gap-2">
                        <div className="relative group/menu">
                            <button className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>

                            <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-xl bg-[#111] border border-white/10 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20">
                                <button
                                    onClick={() => onDelay?.(task.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                    <Clock className="w-4 h-4" />
                                    Report Delay
                                </button>
                                <button
                                    onClick={() => onSkip?.(task.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    Skip Task
                                </button>
                            </div>
                        </div>

                        <div
                            onClick={onToggle}
                            className="p-1 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="w-5 h-5" />
                            </motion.div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 pt-0 pl-14 pr-8 space-y-4">
                                <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-2">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {task.description}
                                    </p>
                                </div>

                                {/* Sub-steps Checklist */}
                                {task.subSteps && task.subSteps.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Checklist
                                        </h4>
                                        <div className="space-y-1">
                                            {task.subSteps.map((step, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleSubStep(idx); }}
                                                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group/item cursor-pointer"
                                                >
                                                    <button className="mt-0.5 text-muted-foreground group-hover/item:text-primary transition-colors">
                                                        {step.isCompleted ? <CheckSquare className="w-4 h-4 text-green-500" /> : <Square className="w-4 h-4" />}
                                                    </button>
                                                    <span className={cn("text-sm text-gray-300", step.isCompleted && "line-through opacity-50")}>
                                                        {step.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <div className="mt-0.5 p-1 rounded-full bg-indigo-500/20 text-indigo-400">
                                        <AlertCircle className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                                            Why this step?
                                        </h4>
                                        <p className="text-xs text-indigo-200/80">
                                            {task.rationale}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button
                                        onClick={handleExplain}
                                        disabled={isExplaining}
                                        className="text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                    >
                                        {isExplaining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
                                        {isExplaining ? "Analyzing..." : "Explain with AI"}
                                    </button>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleRefine}
                                            disabled={isRefining}
                                            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-white transition-colors disabled:opacity-50 px-2 py-1"
                                        >
                                            {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            {isRefining ? "Refining..." : "Refine Step"}
                                        </button>
                                        {task.status === 'pending' && (
                                            <button
                                                onClick={handleStart}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                                            >
                                                Start Task <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* AI Explanation Modal */}
            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowExplanation(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-2 text-purple-400">
                                    <Sparkles className="w-4 h-4" />
                                    <h3 className="font-semibold text-sm">AI Strategic Reasoning</h3>
                                </div>
                                <button
                                    onClick={() => setShowExplanation(false)}
                                    className="text-muted-foreground hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <h4 className="text-lg font-bold text-white mb-2">{task.title}</h4>
                                <div className="prose prose-sm prose-invert max-w-none">
                                    <p className="text-gray-300 leading-relaxed">
                                        {task.aiReasoning}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={() => setShowExplanation(false)}
                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
