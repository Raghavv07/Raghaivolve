
"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02]">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
                <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No strategies yet</h3>
            <p className="text-muted-foreground max-w-md mb-8">
                Your command center is empty. Start by describing a goal, and Raghaivolve will generate a complete execution plan for you.
            </p>
            <Link
                href="/strategy/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium hover:scale-105"
            >
                <span>Create my first strategy</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
