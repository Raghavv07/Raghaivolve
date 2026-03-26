"use client";

import { Sparkles, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StrategyTask as Task } from "@/lib/megallm";

interface NextActionCardProps {
    task: Task;
    reason: string;
    onStart: () => void;
}

export default function NextActionCard({ task, reason, onStart }: NextActionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
        >
            <div className="bg-[#0A0A0A] rounded-xl p-6 border border-white/10 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            AI Recommendation
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {task.title}
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                            {reason}
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <button
                            onClick={onStart}
                            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
                        >
                            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                            Start This Task
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
