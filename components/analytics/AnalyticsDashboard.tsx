"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import AIInsights from "./AIInsights";
import { getAnalyticsInsightsAction } from "@/app/actions";

interface AnalyticsStats {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
    iconName: "trending-up" | "check" | "alert" | "clock";
}

interface BottleneckData {
    stage: string;
    count: number;
    percentage: number;
}

// Assuming a structure for dailyActivity data
interface DailyActivityData {
    date: string;
    completed: number;
    hours: number;
}

interface AnalyticsDashboardProps {
    stats: AnalyticsStats[];
    bottlenecks: BottleneckData[];
    dailyActivity?: DailyActivityData[]; // Made optional to avoid issues if not passed yet
}

const iconMap = {
    "trending-up": TrendingUp,
    "check": CheckCircle2,
    "alert": AlertTriangle,
    "clock": Clock
};

export default function AnalyticsDashboard({ stats, bottlenecks, dailyActivity }: AnalyticsDashboardProps) {
    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                // Construct metrics object from stats
                const metrics = stats.reduce((acc, stat) => {
                    acc[stat.label.replace(/\s+/g, '')] = stat.value;
                    return acc;
                }, {} as any);

                const data = await getAnalyticsInsightsAction(metrics);
                setInsights(data);
            } catch (error) {
                console.error("Failed to load insights", error);
            } finally {
                setLoadingInsights(false);
            }
        };

        if (stats.length > 0) {
            fetchInsights();
        }
    }, [stats]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Analytics Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Track your productivity trends and insights.</p>
                </div>
            </div>

            <AIInsights insights={insights} isLoading={loadingInsights} />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = iconMap[stat.iconName];
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-white/5 text-muted-foreground group-hover:text-white transition-colors">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                                    stat.trend === "up" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bottleneck Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Execution Bottlenecks
                        </h2>
                        <span className="text-xs text-muted-foreground">Last 30 Days</span>
                    </div>

                    <div className="space-y-4">
                        {bottlenecks.map((item, i) => (
                            <div key={item.stage} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white">{item.stage}</span>
                                    <span className="text-muted-foreground">{item.count} stalled tasks</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percentage}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                                        className={cn(
                                            "h-full rounded-full",
                                            i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : "bg-primary"
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Risk Indicators */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Risk Radar
                    </h2>

                    <div className="space-y-4">
                        {[
                            { title: "Market Volatility", risk: "high", desc: "Competitor pricing shift detected." },
                            { title: "Resource Availability", risk: "medium", desc: "Dev team capacity at 95%." },
                            { title: "Timeline Slippage", risk: "low", desc: "Current buffer: 3 days." },
                        ].map((risk, i) => (
                            <div key={risk.title} className="p-3 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-medium text-white">{risk.title}</span>
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        risk.risk === "high" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                            risk.risk === "medium" ? "bg-orange-500" : "bg-green-500"
                                    )} />
                                </div>
                                <p className="text-xs text-muted-foreground">{risk.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
