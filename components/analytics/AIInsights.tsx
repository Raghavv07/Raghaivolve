"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Lightbulb } from "lucide-react";

interface AIInsightsProps {
    insights: {
        workingWell: string;
        struggles: string;
        improvements: string;
    } | null;
    isLoading?: boolean;
}

export default function AIInsights({ insights, isLoading }: AIInsightsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/10" />
                ))}
            </div>
        );
    }

    if (!insights) return null;

    const cards = [
        {
            title: "What's Working",
            icon: TrendingUp,
            content: insights.workingWell,
            color: "text-green-400",
            bg: "bg-green-400/10",
            border: "border-green-400/20"
        },
        {
            title: "Challenges",
            icon: AlertCircle,
            content: insights.struggles,
            color: "text-orange-400",
            bg: "bg-orange-400/10",
            border: "border-orange-400/20"
        },
        {
            title: "Suggestion",
            icon: Lightbulb,
            content: insights.improvements,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl border ${card.border} ${card.bg} backdrop-blur-sm`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                        <h3 className={`font-bold ${card.color}`}>{card.title}</h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        {card.content}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
