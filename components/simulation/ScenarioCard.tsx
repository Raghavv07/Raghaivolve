"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScenarioProps {
    name: "Best Case" | "Most Likely" | "Worst Case";
    completionTime: string;
    successLikelihood: number;
    risks: string[];
    decisionPoints: string[];
    explanation: string;
    isActive: boolean;
    onClick: () => void;
}

const themeMap = {
    "Best Case": { color: "text-green-400", border: "border-green-500/20", bg: "bg-green-500/5", bar: "bg-green-500" },
    "Most Likely": { color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", bar: "bg-blue-500" },
    "Worst Case": { color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5", bar: "bg-red-500" }
};

export default function ScenarioCard({ name, completionTime, successLikelihood, risks, decisionPoints, explanation, isActive, onClick }: ScenarioProps) {
    const theme = themeMap[name as keyof typeof themeMap] || themeMap["Most Likely"];

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            className={cn(
                "cursor-pointer p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                theme.bg,
                isActive ? `border-2 ${theme.border.replace("/20", "/50")}` : "border-white/5 opacity-70 hover:opacity-100"
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className={cn("text-xl font-bold", theme.color)}>{name}</h3>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Likelihood</span>
                    <span className="text-lg font-bold text-white">{successLikelihood}%</span>
                </div>
            </div>

            {/* Confidence Bar */}
            <div className="h-1.5 w-full bg-black/20 rounded-full mb-6">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${successLikelihood}%` }}
                    className={cn("h-full rounded-full", theme.bar)}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Impact</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{explanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-black/20">
                        <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
                        <div className="font-semibold text-white">{completionTime}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/20">
                        <div className="text-xs text-muted-foreground mb-1">Key Decisions</div>
                        <div className="font-semibold text-white">{decisionPoints.length} Points</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
