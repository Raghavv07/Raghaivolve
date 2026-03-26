"use client";

import { useState } from "react";
import { Zap, ArrowRight, LayoutList, Clock } from "lucide-react";
import { Strategy } from "@/lib/db";
import ActionConnectorsModal from "@/components/strategy/ActionConnectorsModal";

export default function ActionsPageClient({ strategies }: { strategies: Strategy[] }) {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (strategy: Strategy) => {
        // Ensure tasks exist, tasks property is optional in type but should be in data
        if (strategy.tasks && strategy.tasks.length > 0) {
            setSelectedStrategy(strategy);
            setIsModalOpen(true);
        } else {
            // Fallback or alert if no tasks (shouldn't happen for active strategies usually)
            console.warn("No tasks found for strategy", strategy.id);
        }
    };

    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-emerald-500" />
                        Action Connectors
                    </h1>
                    <p className="text-muted-foreground">
                        Turn your strategy into execution. Export tasks to your favorite tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {strategies.map(strategy => (
                        <div key={strategy.id} className="group relative bg-zinc-900/50 border border-white/10 rounded-xl p-6 hover:bg-zinc-800/50 transition-all hover:border-emerald-500/30">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                    Active
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                {strategy.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                                {strategy.summary || "No summary available."}
                            </p>

                            <div className="flex items-center justify-between text-xs text-zinc-500 mb-6">
                                <span className="flex items-center gap-1.5">
                                    <LayoutList className="w-3.5 h-3.5" />
                                    {strategy.tasksCount} Tasks
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Updated recently
                                </span>
                            </div>

                            <button
                                onClick={() => handleOpenModal(strategy)}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-pointer"
                            >
                                Open & Export Actions
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    ))}

                    {strategies.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-xl">
                            <Zap className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-1">No Active Strategies</h3>
                            <p className="text-muted-foreground mb-6">Create a strategy first to start exporting actions.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedStrategy && (
                <ActionConnectorsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    tasks={selectedStrategy.tasks || []}
                    strategyTitle={selectedStrategy.title}
                />
            )}
        </div>
    );
}
