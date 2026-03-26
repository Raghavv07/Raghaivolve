"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Loader2,
    CheckCircle2,
    X,
    LayoutList,
    ArrowRight
} from "lucide-react";
import { updateTaskStatusAction } from "@/app/actions";
import { StrategyTask as Task } from "@/lib/megallm";
import { cn } from "@/lib/utils";

interface TaskStartModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    strategyId: string;
    index: number;
    onTaskUpdate?: (updatedTask: Task) => void;
}

export default function TaskStartModal({
    isOpen,
    onClose,
    task,
    strategyId,
    index,
    onTaskUpdate
}: TaskStartModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [updatedTask, setUpdatedTask] = useState<Task | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (isOpen) {
            setIsLoading(true);
            setError(null);
            // Trigger the start action automatically
            updateTaskStatusAction(strategyId, index, "in-progress")
                .then((result) => {
                    if (!isMounted) return;
                    if (!result) throw new Error("No result returned from server");
                    // Merge result with existing task to keep client-side props like ID
                    const merged = { ...task, ...result } as Task;
                    setUpdatedTask(merged);
                    if (onTaskUpdate) {
                        onTaskUpdate(merged);
                    }
                })
                .catch((err) => {
                    if (!isMounted) return;
                    console.error("Failed to start task:", err);
                    setError("Failed to generate checklist. Please try again.");
                })
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen, strategyId, index]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-start gap-4">
                    <div className={cn("p-3 rounded-full", error ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500")}>
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : error ? <X className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isLoading ? "Starting Task..." : error ? "Error Starting Task" : "Task Started"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isLoading
                                ? "AI is analyzing requirements and generating your checklist."
                                : error
                                    ? "We encountered an issue while generating your checklist."
                                    : "Your execution checklist is ready."}
                        </p>
                    </div>
                    {!isLoading && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                    />
                                </div>
                                <p className="text-xs text-center text-muted-foreground">Decomposing task into actionable steps...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm center">
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                    <LayoutList className="w-4 h-4 text-blue-400" />
                                    Action Checklist
                                </h3>
                                <div className="space-y-3">
                                    {updatedTask?.subSteps && updatedTask.subSteps.length > 0 ? (
                                        updatedTask.subSteps.map((step, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 p-2 rounded-lg bg-black/20"
                                            >
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-sm text-gray-300">{step.title}</span>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground text-sm italic">
                                            No checklist items generated.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && (
                    <div className="p-6 pt-0">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium text-white transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            Let's Get to Work
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
