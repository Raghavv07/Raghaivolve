
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardHeader({ userName }: { userName?: string }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">
                    Good morning, <span className="text-primary">{userName || "Planner"}</span>
                </h1>
                <p className="text-muted-foreground">Here's what's happening with your strategies today.</p>
            </div>
            <Link
                href="/strategy/new"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span>New Strategy</span>
            </Link>
        </div>
    );
}
