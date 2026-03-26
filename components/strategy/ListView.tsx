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
    Play
} from "lucide-react";
import { updateTaskStatusAction } from "@/app/actions";
import { useState } from "react";

interface ListViewProps {
    tasks: Task[];
    strategyId: string;
    onStart: (task: Task, index: number) => void;
    onUpdate: (task: Task, index: number) => void;
}

export default function ListView({ tasks, strategyId, onStart, onUpdate }: ListViewProps) {
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#111]">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                        <th className="p-4 font-medium text-muted-foreground w-10">#</th>
                        <th className="p-4 font-medium text-muted-foreground">Status</th>
                        <th className="p-4 font-medium text-muted-foreground">Task</th>
                        <th className="p-4 font-medium text-muted-foreground">Priority</th>
                        <th className="p-4 font-medium text-muted-foreground">Duration</th>
                        <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {tasks.map((task, index) => (
                        <ListRow
                            key={task.id}
                            task={task}
                            index={index}
                            strategyId={strategyId}
                            onStart={() => onStart(task, index)}
                            onUpdate={(t) => onUpdate(t, index)}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                No tasks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function ListRow({
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
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="p-4 text-muted-foreground">{index + 1}</td>
            <td className="p-4">
                {task.status === "completed" ? (
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                    </div>
                ) : task.status === "in-progress" ? (
                    <div className="flex items-center gap-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin-slow" />
                        <span>Active</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Circle className="w-4 h-4" />
                        <span>Pending</span>
                    </div>
                )}
            </td>
            <td className="p-4">
                <div className="font-medium text-gray-200">{task.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{task.description}</div>
            </td>
            <td className="p-4">
                <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider",
                    task.priority === "high" ? "text-red-400 border-red-400/20 bg-red-400/5" :
                        task.priority === "medium" ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5" :
                            "text-blue-400 border-blue-400/20 bg-blue-400/5"
                )}>
                    {task.priority}
                </span>
            </td>
            <td className="p-4 text-gray-400 flex items-center gap-2">
                <Clock className="w-3 h-3 opacity-50" /> {task.estimatedTime}
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    {task.status === "pending" && (
                        <button
                            onClick={onStart}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-colors"
                            title="Start Task"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    {task.status === "in-progress" && (
                        <button
                            onClick={handleComplete}
                            disabled={isCompleting}
                            className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                            title="Complete Task"
                        >
                            {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                    )}
                    <button className="p-2 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
