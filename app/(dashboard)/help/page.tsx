"use client";

import {
    LayoutDashboard,
    Plus,
    Play,
    Bot,
    Sparkles,
    Zap,
    BarChart3,
    CheckCircle2,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-4xl mx-auto space-y-12 pb-20">

                {/* Header */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Help & Documentation</h1>
                    <p className="text-xl text-muted-foreground">
                        Master Raghaivolve. Learn how to generate, execute, and optimize your strategies.
                    </p>
                </div>

                {/* Quick Start Guide */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                            <Plus className="w-5 h-5" />
                        </span>
                        Getting Started: Create a Strategy
                    </h2>
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                        <p className="text-zinc-300 leading-relaxed">
                            Everything starts with a problem. The Raghaivolve AI engine takes your challenge and breaks it down into an actionable plan.
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-2">
                            <li>Navigate to <Link href="/strategy/new" className="text-primary hover:underline">Create Strategy</Link>.</li>
                            <li>Describe your problem or goal in detail (e.g., "Launch a new coffee brand in NYC").</li>
                            <li>Add constraints like budget, timeline, or resources.</li>
                            <li>Click <strong>Generate Strategy</strong>. The AI will analyze the problem and create a step-by-step plan.</li>
                        </ol>
                    </div>
                </section>

                {/* Dashboard & Execution */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <LayoutDashboard className="w-5 h-5" />
                        </span>
                        Dashboard & Execution
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Play className="w-4 h-4 text-emerald-500" /> Managing Plans
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Your <strong>Dashboard</strong> gives you a bird's-eye view of all active strategies.
                                Click on any strategy card to view its detailed roadmap.
                            </p>
                        </div>
                        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tracking Progress
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Inside a strategy, check off tasks as you complete them.
                                The progress bar updates automatically, giving you real-time feedback on your momentum.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Strategy Copilot */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500">
                            <Bot className="w-5 h-5" />
                        </span>
                        Strategy Copilot
                    </h2>
                    <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                        <p className="text-zinc-300">
                            Stuck on a task? The <strong>Strategy Copilot</strong> is a context-aware AI assistant that knows your specific plan inside and out.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Ask about Risks</p>
                                <p className="text-sm text-zinc-300">"What are the biggest risks in phase 1?"</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Get Advice</p>
                                <p className="text-sm text-zinc-300">"How should I approach this marketing task?"</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Clarify dependencies</p>
                                <p className="text-sm text-zinc-300">"Why is the legal review blocked?"</p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <Link href="/copilot" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                Open Copilot <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Advanced Features */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500">
                            <Sparkles className="w-5 h-5" />
                        </span>
                        Advanced Tools
                    </h2>
                    <div className="grid gap-4">
                        <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/10 flex gap-4 items-start hover:bg-zinc-900/50 transition-colors">
                            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">Monte Carlo Simulation</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Predict the success rate of your strategy by running thousands of simulations.
                                    Identify bottlenecks before they happen.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/10 flex gap-4 items-start hover:bg-zinc-900/50 transition-colors">
                            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">Action Connectors</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Turn plan into action. Connect your strategy to external tools like Slack, Jira, or Email
                                    to automate workflows directly from Raghaivolve.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/10 flex gap-4 items-start hover:bg-zinc-900/50 transition-colors">
                            <BarChart3 className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-white">Analytics Hub</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Monitor your <strong>Strategy Health Score</strong>. We analyze task completion velocity,
                                    risk factors, and team momentum to give you a live health metric.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer / Support */}
                <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-muted-foreground">
                        Need more help? Contact our support team at <a href="#" className="text-primary hover:underline">support@raghaivolve.ai</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
