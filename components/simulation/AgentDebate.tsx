"use client";

import { motion } from "framer-motion";
import { User, ShieldAlert, BadgeCheck, Activity, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentOpinion {
    agentName: "Optimizer" | "Risk Analyst" | "Quality Assurance" | "Execution Realist";
    critique: string;
    suggestion: string;
}

interface AgentDebateProps {
    opinions: AgentOpinion[];
    synthesis: string;
}

const agentConfig = {
    "Optimizer": { icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
    "Risk Analyst": { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10" },
    "Quality Assurance": { icon: BadgeCheck, color: "text-green-400", bg: "bg-green-500/10" },
    "Execution Realist": { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" }
};

export default function AgentDebate({ opinions, synthesis }: AgentDebateProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opinions.map((op, i) => {
                    const config = agentConfig[op.agentName] || agentConfig["Execution Realist"];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={op.agentName}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-xl bg-white/5 border border-white/10"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg", config.bg)}>
                                    <Icon className={cn("w-5 h-5", config.color)} />
                                </div>
                                <h4 className={cn("font-bold", config.color)}>{op.agentName}</h4>
                            </div>
                            <p className="text-sm text-gray-400 italic mb-3">"{op.critique}"</p>
                            <div className="text-xs font-medium text-white bg-white/5 px-3 py-2 rounded border-l-2 border-white/20">
                                Suggestion: {op.suggestion}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20"
            >
                <div className="flex items-center gap-3 mb-4">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Consensus Synthesis</h3>
                </div>
                <p className="text-base text-gray-200 leading-relaxed">
                    {typeof synthesis === 'string' ? synthesis : (synthesis as any).finalConsensusPlan || JSON.stringify(synthesis)}
                </p>
            </motion.div>
        </div>
    );
}
