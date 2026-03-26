"use client";

import { useState } from "react";
import TaskCard from "@/components/strategy/TaskCard";
import { StrategyTask as Task } from "@/lib/megallm";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export interface ExecutionTask {
    task: Task;
    strategyId: string;
    strategyTitle: string;
    taskIndex: number;
}

interface ExecutionViewProps {
    tasks: ExecutionTask[];
}

export default function ExecutionView({ tasks }: ExecutionViewProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Play className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Execution Mode</h1>
                    <p className="text-sm text-muted-foreground">Focus on your immediate tasks.</p>
                </div>
            </div>

            {tasks.length > 0 ? (
                <div className="space-y-6">
                    {tasks.map((item, i) => {
                        const compositeId = `${item.strategyId}-${item.taskIndex}`;
                        return (
                            <motion.div
                                key={compositeId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-2 px-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">
                                        {item.strategyTitle}
                                    </span>
                                </div>
                                <TaskCard
                                    task={item.task}
                                    strategyId={item.strategyId}
                                    index={item.taskIndex}
                                    isExpanded={expandedId === compositeId}
                                    onToggle={() => setExpandedId(expandedId === compositeId ? null : compositeId)}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl border-dashed border-white/10 bg-white/5">
                    <div className="p-4 rounded-full bg-white/5 mb-4">
                        <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">All Caught Up!</h3>
                    <p className="text-muted-foreground max-w-sm">
                        You have no tasks currently in progress. Start a task from your
                        <a href="/strategies" className="text-primary hover:underline mx-1">Active Strategies</a>
                        to see it here.
                    </p>
                </div>
            )}
        </div>
    );
}
