"use client";

import { StrategyTask as Task } from "@/lib/megallm";
import { cn } from "@/lib/utils";
import {
    Circle,
    CheckCircle2,
    Clock,
    MoreHorizontal,
    ArrowRight,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { updateTaskStatusAction } from "@/app/actions";
import { useState } from "react";

interface KanbanBoardProps {
    tasks: Task[];
    strategyId: string;
    onStart: (task: Task, index: number) => void;
    onUpdate: (task: Task, index: number) => void;
}

export default function KanbanBoard({ tasks, strategyId, onStart, onUpdate }: KanbanBoardProps) {
    const columns = [
        { id: "pending", title: "To Do", icon: Circle, color: "text-muted-foreground" },
        { id: "in-progress", title: "In Progress", icon: Clock, color: "text-blue-500" },
        { id: "completed", title: "Done", icon: CheckCircle2, color: "text-green-500" }
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="flex flex-col gap-4 min-w-75">
                    <div className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-2">
                            <col.icon className={cn("w-4 h-4", col.color)} />
                            <h3 className="font-semibold text-sm text-gray-200">{col.title}</h3>
                            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {tasks.map((task, index) => {
                            if (task.status !== col.id) return null;
                            return (
                                <KanbanCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    strategyId={strategyId}
                                    onStart={() => onStart(task, index)}
                                    onUpdate={(t) => onUpdate(t, index)}
                                />
                            );
                        })}
                        {tasks.filter(t => t.status === col.id).length === 0 && (
                            <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-muted-foreground bg-white/5">
                                No tasks
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function KanbanCard({
    task,
    index,
    strategyId,
    onStart,
    onUpdate
}: {
    task: Task,
    index: number,
    strategyId: string,
    onStart: () => void,
    onUpdate: (t: Task) => void
}) {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = async () => {
        if (isCompleting) return;
        setIsCompleting(true);
        try {
            await updateTaskStatusAction(strategyId, index, "completed");
            onUpdate({ ...task, status: "completed" });
        } catch (e) {
            console.error("Failed to complete task", e);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="p-4 rounded-xl bg-[#111] border border-white/10 hover:border-white/20 transition-all group space-y-3 shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex gap-2">
                    <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider",
                        task.priority === "high" ? "text-red-400 border-red-400/20 bg-red-400/5" :
                            task.priority === "medium" ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                                "text-blue-400 border-blue-400/20 bg-blue-400/5"
                    )}>
                        {task.priority}
                    </span>
                    {task.riskLevel === 'high' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider text-orange-400 border-orange-400/20 bg-orange-400/5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Risk
                        </span>
                    )}
                </div>
                <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-200 line-clamp-2">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-3">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimatedTime || "No estimate"}</span>
                </div>

                {task.status === "pending" && (
                    <button
                        onClick={onStart}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2.5 py-1 rounded flex items-center gap-1 transition-colors font-medium"
                    >
                        Start <ArrowRight className="w-3 h-3" />
                    </button>
                )}

                {task.status === "in-progress" && (
                    <button
                        onClick={handleComplete}
                        disabled={isCompleting}
                        className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                        {isCompleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Complete
                    </button>
                )}
            </div>

            {/* Mini Progress Bar for sub-steps if active */}
            {task.status === "in-progress" && task.subSteps && task.subSteps.length > 0 && (
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(task.subSteps.filter(s => s.isCompleted).length / task.subSteps.length) * 100}%` }}
                    />
                </div>
            )}
        </div>
    );
}
