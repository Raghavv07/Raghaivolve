"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, MessageSquare, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSimulationAction, runDebateAction } from "@/app/actions";
import ScenarioCard from "./ScenarioCard";
import AgentDebate from "./AgentDebate";
import { Scenario, DebateResult } from "@/lib/megallm";

export default function SimulationView({ strategyId }: { strategyId: string }) {
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [debate, setDebate] = useState<DebateResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeScenario, setActiveScenario] = useState<number>(1); // Default to Most Likely (index 1 usually)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetch
                const [scenariosData, debateData] = await Promise.all([
                    getSimulationAction(strategyId),
                    runDebateAction(strategyId)
                ]);

                if (scenariosData) setScenarios(scenariosData);
                if (debateData) setDebate(debateData);

                // Set default active to "Most Likely" if found
                if (scenariosData) {
                    const idx = scenariosData.findIndex(s => s.name === "Most Likely");
                    if (idx >= 0) setActiveScenario(idx);
                }
            } catch (error) {
                console.error("Simulation load error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [strategyId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <h2 className="text-xl font-semibold text-white">Running AI Simulations...</h2>
                <p className="text-muted-foreground">Agents are debating your strategy and projecting outcomes.</p>
            </div>
        );
    }

    if (!scenarios || scenarios.length === 0) {
        return (
            <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
                {/* Header with Back Link */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/strategy/${strategyId}/plan`}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Simulation Failed</h1>
                </div>

                <div className="p-10 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">Could not generate simulation</h3>
                    <p className="text-muted-foreground mb-6">The AI service might be unavailable or the strategy content is insufficient.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                    >
                        Retry Simulation
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/strategy/${strategyId}/plan`}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        AI Strategy Simulator
                    </h1>
                    <p className="text-muted-foreground">Projected outcomes and multi-agent critique.</p>
                </div>
            </div>

            {/* Scenarios Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Target className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-white">Future Scenarios</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {scenarios.map((scenario, index) => (
                        <ScenarioCard
                            key={index}
                            {...scenario}
                            isActive={index === activeScenario}
                            onClick={() => setActiveScenario(index)}
                        />
                    ))}
                </div>
            </section>

            {/* Debate Section */}
            {debate && (
                <section className="pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-8">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-bold text-white">Multi-Agent Debate Engine</h2>
                    </div>

                    <AgentDebate
                        opinions={debate.opinions}
                        synthesis={debate.synthesis}
                    />
                </section>
            )}
        </div>
    );
}
