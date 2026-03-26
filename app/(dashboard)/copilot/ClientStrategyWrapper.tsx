"use client";

import { Strategy } from "@/lib/db";
import { useState, useEffect } from "react";
import StrategySelector from "@/components/copilot/StrategySelector";
import CopilotChatInterface from "@/components/copilot/CopilotChatInterface";
import { Bot } from "lucide-react";

export default function ClientStrategyWrapper({ strategies }: { strategies: Strategy[] }) {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

    // Auto-select first strategy if available and none selected
    useEffect(() => {
        if (strategies.length > 0 && !selectedStrategy) {
            setSelectedStrategy(strategies[0]);
        }
    }, [strategies]);

    return (
        <div className="flex-1 flex flex-col h-full min-h-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bot className="w-6 h-6 text-emerald-500" />
                        Strategy Copilot
                    </h1>
                    <p className="text-muted-foreground text-xs md:text-sm">
                        Chat with your strategy. Context-aware AI guidance.
                    </p>
                </div>
                <StrategySelector
                    strategies={strategies}
                    selectedStrategyId={selectedStrategy?.id || null}
                    onSelect={setSelectedStrategy}
                />
            </div>

            {selectedStrategy ? (
                <CopilotChatInterface strategy={selectedStrategy} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-zinc-900/20 text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Select a Strategy</h3>
                    <p className="text-muted-foreground max-w-md">
                        Choose an active strategy from the dropdown above to start chatting with your AI Copilot.
                    </p>
                </div>
            )}
        </div>
    );
}
