"use client";

import { Strategy } from "@/lib/db";
import { ChevronDown, Check, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StrategySelectorProps {
    strategies: Strategy[];
    selectedStrategyId: string | null;
    onSelect: (strategy: Strategy) => void;
}

export default function StrategySelector({ strategies, selectedStrategyId, onSelect }: StrategySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedStrategy = strategies.find(s => s.id === selectedStrategyId);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors w-full md:w-80 justify-between"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-500 shrink-0">
                        <Zap className="w-4 h-4" />
                    </div>
                    {selectedStrategy ? (
                        <div className="flex flex-col items-start truncate">
                            <span className="text-sm font-medium text-white truncate w-full">{selectedStrategy.title}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{selectedStrategy.status}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">Select a strategy...</span>
                    )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full md:w-96 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {strategies.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No active strategies found.
                            </div>
                        ) : (
                            strategies.map(strategy => (
                                <button
                                    key={strategy.id}
                                    onClick={() => {
                                        onSelect(strategy);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                                        selectedStrategyId === strategy.id ? "bg-white/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shrink-0",
                                            strategy.status === 'executing' ? "bg-blue-500" : "bg-zinc-500"
                                        )} />
                                        <div className="truncate">
                                            <div className="text-sm font-medium text-white truncate">{strategy.title}</div>
                                            <div className="text-xs text-zinc-500">{strategy.tasksCount} Tasks • {strategy.progress}% Done</div>
                                        </div>
                                    </div>
                                    {selectedStrategyId === strategy.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
