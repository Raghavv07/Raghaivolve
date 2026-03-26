
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StrategyTask } from '@/lib/megallm';
import { GitBranch, ChevronsRight, AlertCircle, Maximize2, X, Loader2, Sparkles } from 'lucide-react';
import { traceDecisionsAction } from '@/app/actions';

interface DecisionTraceabilityMapProps {
    tasks: StrategyTask[];
    strategyId: string;
    problemStatement?: string;
}

export default function DecisionTraceabilityMap({ tasks, strategyId, problemStatement = "Strategy Goal" }: DecisionTraceabilityMapProps) {
    const [selectedNode, setSelectedNode] = useState<StrategyTask | null>(null);
    const [isTracing, setIsTracing] = useState(false);

    const handleTrace = async () => {
        if (!selectedNode) return;
        setIsTracing(true);
        try {
            const context = await traceDecisionsAction(strategyId, selectedNode.id);
            if (context) {
                // Optimistically update the selected node
                setSelectedNode(prev => prev ? { ...prev, decisionContext: context } : null);
            }
        } catch (error) {
            console.error("Failed to trace decisions:", error);
        } finally {
            setIsTracing(false);
        }
    };

    return (
        <div className="relative h-[600px] w-full bg-black/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                {/* Root Node */}
                <div className="flex flex-col items-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-primary/20 border border-primary/50 text-white rounded-xl shadow-lg shadow-primary/10 max-w-md text-center"
                    >
                        <h3 className="font-bold text-lg mb-1">🎯 Problem Statement</h3>
                        <p className="text-sm text-primary-foreground/80">{problemStatement}</p>
                    </motion.div>
                    <div className="h-8 w-px bg-white/20 my-2" />
                    <div className="p-2 bg-white/5 rounded-full border border-white/10">
                        <ChevronsRight className="w-4 h-4 text-white/50" />
                    </div>
                    <div className="h-8 w-px bg-white/20 my-2" />
                </div>

                {/* Task Nodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map((task, index) => (
                        <motion.button
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedNode(task)}
                            className={`relative group text-left p-4 rounded-xl border transition-all duration-300 w-full
                                ${selectedNode?.id === task.id
                                    ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${task.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    }`}>
                                    {task.priority.toUpperCase()}
                                </span>
                                {task.decisionContext && (
                                    <GitBranch className="w-4 h-4 text-purple-400" />
                                )}
                            </div>

                            <h4 className="font-semibold text-white mb-2 line-clamp-2">{task.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-3">{task.description}</p>

                            {/* Connector Line (Implied) */}
                            <div className="absolute -top-8 left-1/2 w-px h-8 bg-white/10 -translate-x-1/2 group-hover:bg-white/30 transition-colors" />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Detail Modal / Panel */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-[#0A0A0A] border-l border-white/10 p-6 shadow-2xl z-20 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-white">Decision Logic</h3>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Why we chose this</h4>
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-white/90">
                                    {selectedNode.decisionContext?.reason || selectedNode.rationale}
                                </div>
                            </div>

                            {selectedNode.decisionContext?.alternatives && selectedNode.decisionContext.alternatives.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Alternatives Considered</h4>
                                    <ul className="space-y-3">
                                        {selectedNode.decisionContext.alternatives.map((alt, i) => (
                                            <li key={i} className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                    <span className="text-sm text-white/80">{alt}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedNode.decisionContext?.tradeoffs && (
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Trade-offs Accepted</h4>
                                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-sm text-white/80">
                                        {selectedNode.decisionContext.tradeoffs}
                                    </div>
                                </div>
                            )}

                            {!selectedNode.decisionContext && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">Detailed decision context not yet generated for this task.</p>
                                    <button
                                        onClick={handleTrace}
                                        disabled={isTracing}
                                        className="mt-4 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-sm text-purple-400 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                    >
                                        {isTracing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        {isTracing ? "Tracing Decision..." : "Generate Decision Trace"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

