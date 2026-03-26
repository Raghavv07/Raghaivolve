"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    ArrowRight,
    Clock,
    Zap,
    Target,
    Users,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

const guidanceChips = [
    { label: "Launch a Product", icon: RocketIcon },
    { label: "Optimize Workflow", icon: Zap },
    { label: "Market Entry", icon: TrendingUp },
    { label: "Reduce Churn", icon: Users },
];

function RocketIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    );
}

export default function StrategyInput() {
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConstraints, setShowConstraints] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Constraints State
    const [deadline, setDeadline] = useState("");
    const [urgency, setUrgency] = useState("medium");
    const [resources, setResources] = useState("");

    const handleGenerate = async () => {
        if (!input.trim()) return;

        setIsGenerating(true);
        setErrorMessage(""); // Clear previous errors

        try {
            const formData = new FormData();
            formData.append("problem", input);
            formData.append("deadline", deadline);
            formData.append("urgency", urgency);
            formData.append("resources", resources);

            // Dynamically import to avoid server-action-in-client-component issues if not carefully handled, 
            // but normally we import the action.
            // Assuming createStrategyAction is importable.
            const { createStrategyAction } = await import("@/app/actions");
            const result = await createStrategyAction(formData);

            // Check if the result contains an error
            if (result && 'error' in result) {
                setErrorMessage(result.error);
                setIsGenerating(false);
            }
            // If no error, the action will redirect automatically
        } catch (error: unknown) {
            // Check for redirect errors and let them propagate
            const maybeRedirectError = error as { digest?: string; message?: string };
            if (maybeRedirectError.digest?.includes('NEXT_REDIRECT') || maybeRedirectError.message?.includes('NEXT_REDIRECT')) {
                throw error;
            }
            console.error("Generation failed", error);
            setErrorMessage("An unexpected error occurred. Please try again.");
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="space-y-2 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4"
                >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Strategy Engine</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight text-white"
                >
                    What problem do you want to solve?
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-muted-foreground"
                >
                    Describe your goal in plain English, and our AI will break it down into an actionable strategy.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative space-y-6">
                    <div className="space-y-4">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., I want to launch a SaaS product in 3 months with a budget of $5k..."
                            className="w-full h-40 bg-transparent text-xl md:text-2xl text-white placeholder:text-white/20 resize-none focus:outline-none scrollbar-hide"
                            disabled={isGenerating}
                        />

                        <div className="flex flex-wrap gap-2">
                            {guidanceChips.map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => setInput(input + (input ? " " : "") + chip.label)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-xs md:text-sm text-muted-foreground hover:text-white transition-all duration-200"
                                >
                                    <chip.icon className="w-3 h-3 md:w-4 md:h-4" />
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <button
                            onClick={() => setShowConstraints(!showConstraints)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                        >
                            {showConstraints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {showConstraints ? "Hide Constraints" : "Add Constraints (Optional)"}
                        </button>

                        <AnimatePresence>
                            {showConstraints && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Deadline
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 2 weeks"
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Target className="w-3 h-3" /> Urgency
                                            </label>
                                            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                                                {['low', 'medium', 'high'].map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => setUrgency(level)}
                                                        className={cn(
                                                            "flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                                                            urgency === level
                                                                ? "bg-primary text-white shadow-lg"
                                                                : "text-muted-foreground hover:text-white"
                                                        )}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                <Users className="w-3 h-3" /> Resources
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 3 devs, $10k"
                                                value={resources}
                                                onChange={(e) => setResources(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Error Message Display */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
                            >
                                <div className="shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                                    <span className="text-red-400 text-xs font-bold">!</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-red-400 mb-1">Error</h4>
                                    <p className="text-sm text-red-300/90">{errorMessage}</p>
                                </div>
                                <button
                                    onClick={() => setErrorMessage("")}
                                    className="shrink-0 text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleGenerate}
                            disabled={!input.trim() || isGenerating}
                            className={cn(
                                "relative group flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300",
                                !input.trim() || isGenerating ? "bg-white/5 cursor-not-allowed opacity-50" : "bg-primary hover:bg-primary/90 hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                            )}
                        >
                            {isGenerating ? (
                                <>
                                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                                    <span>Analyzing Request...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate Strategy</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Thinking Overlay */}
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6"
                            >
                                <BrainCircuit className="w-10 h-10 text-primary" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">Architecting Your Plan</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Analyzing constraints, identifying key milestones, and structuring optimal task flow...
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
