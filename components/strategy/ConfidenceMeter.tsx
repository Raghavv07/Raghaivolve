"use client";

import { Info } from "lucide-react";
import { motion } from "framer-motion";
// Checking deps... user has `lucide-react`. I don't see shadcn tooltip. I'll build a custom simple popover/tooltip.

interface ConfidenceMeterProps {
    score: number;
    factors: { label: string; impact: string }[];
}

export default function ConfidenceMeter({ score, factors }: ConfidenceMeterProps) {
    const getColor = (s: number) => {
        if (s >= 80) return "text-green-500 stroke-green-500 bg-green-500/10";
        if (s >= 50) return "text-yellow-500 stroke-yellow-500 bg-yellow-500/10";
        return "text-red-500 stroke-red-500 bg-red-500/10";
    };

    const colorClass = getColor(score);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative group cursor-help">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="12"
                            cy="12"
                            r={radius} // scaled down visual
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-white/10"
                            style={{ r: 10 }} // override r
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r={radius} // scaled down
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 10}
                            strokeDashoffset={(2 * Math.PI * 10) * (1 - score / 100)}
                            className={colorClass}
                            style={{ r: 10 }}
                        />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Confidence</span>
                    <span className={`text-sm font-bold leading-none ${colorClass.split(" ")[0]}`}>{score}%</span>
                </div>
            </div>

            {/* Tooltip / Popover */}
            <div className="absolute right-0 top-full mt-2 w-64 p-4 rounded-xl bg-[#111] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <h4 className="text-sm font-bold text-white mb-2">Confidence Factors</h4>
                <ul className="space-y-2">
                    {factors.map((f, i) => (
                        <li key={i} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{f.label}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${f.impact === 'positive' ? 'text-green-400 bg-green-400/10' :
                                f.impact === 'negative' ? 'text-red-400 bg-red-400/10' :
                                    'text-gray-400 bg-white/5'
                                }`}>
                                {f.impact}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
