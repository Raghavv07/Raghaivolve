"use client";

import { AlertTriangle, TrendingUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RiskPanelProps {
    risks: any[];
    bottlenecks: string[];
    onClose: () => void;
    isOpen: boolean;
}

export default function RiskPanel({ risks, bottlenecks, onClose, isOpen }: RiskPanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Risk Analysis</h2>
                                        <p className="text-xs text-muted-foreground">AI-detected potential issues</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Bottlenecks Section */}
                            {bottlenecks && bottlenecks.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-orange-400" />
                                        Strategic Bottlenecks
                                    </h3>
                                    <div className="space-y-3">
                                        {bottlenecks.map((b, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 leading-relaxed">
                                                {b}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* High Priority Risks */}
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    Task Risks
                                </h3>

                                {risks && risks.length > 0 ? (
                                    <div className="space-y-3">
                                        {risks.map((risk, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                                                        Task {risk.taskIndex + 1}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 uppercase">
                                                        High Risk
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    {risk.riskReason || risk.reason}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground text-sm border rounded-xl border-dashed border-white/10">
                                        No specific high-risk tasks detected.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
