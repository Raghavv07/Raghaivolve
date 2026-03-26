"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplanningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    delayDays: number;
    impactedTaskCount: number;
}

export default function ReplanningModal({
    isOpen,
    onClose,
    onAccept,
    delayDays,
    impactedTaskCount
}: ReplanningModalProps) {
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
                    <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Plan Adjustment Required</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            A reported delay affecting {impactedTaskCount} downstream tasks.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Comparison Card */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                            <div className="space-y-1">
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Completion</div>
                                <div className="text-lg font-medium text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    Mar 10
                                </div>
                            </div>

                            <ArrowRight className="w-5 h-5 text-muted-foreground/50" />

                            <div className="space-y-1 text-right">
                                <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider">New Completion</div>
                                <div className="text-lg font-bold text-orange-400 flex items-center justify-end gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Mar {10 + delayDays}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Details */}
                    <div>
                        <h3 className="text-sm font-medium text-white mb-3">Impact Analysis</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                                <span>
                                    <strong className="text-white">Technical Architecture Review</strong> pushed back by {delayDays} days.
                                </span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2" />
                                <span>
                                    <strong className="text-white">MVP Build</strong> start date delayed.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-[2] px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium text-white transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Accept New Plan
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
