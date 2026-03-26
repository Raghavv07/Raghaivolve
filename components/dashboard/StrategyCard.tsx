
"use client";

import Link from "next/link";
import { MoreHorizontal, Play, CheckCircle2, CircleDashed, ArrowRight, Trash2, X } from "lucide-react";
import { type Strategy } from "@/lib/db";
import { deleteStrategyAction } from "@/app/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

const statusConfig = {
    planned: { icon: CircleDashed, color: "text-slate-400", bg: "bg-slate-500/10", label: "Planned" },
    executing: { icon: Play, color: "text-blue-400", bg: "bg-blue-500/10", label: "Executing" },
    completed: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Completed" },
};

export default function StrategyCard({ strategy }: { strategy: Strategy }) {
    const status = statusConfig[strategy.status] || statusConfig.planned;
    const StatusIcon = status.icon;
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this strategy? This action cannot be undone.")) {
            setShowMenu(false);
            return;
        }

        setIsDeleting(true);
        try {
            await deleteStrategyAction(strategy.id);
            setIsDeleted(true);
            router.refresh();
        } catch (error) {
            console.error("Failed to delete", error);
            setIsDeleting(false);
        }
    };

    if (isDeleted) return null;

    return (
        <Link
            href={`/strategy/${strategy.id}/plan`}
            className="group relative p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300 hover:shadow-xl cursor-pointer block"
            onClick={() => setShowMenu(false)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{status.label}</span>
                </div>

                <div className="relative z-20">
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-white/5"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    >
                        {showMenu ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? "Deleting..." : "Delete Strategy"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{strategy.title}</h3>

            <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{strategy.tasksCount} Tasks</span>
                    <span>{strategy.progress}% Complete</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${strategy.progress}%` }}
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                <span>Continue Planning</span>
                <ArrowRight className="w-4 h-4 ml-1" />
            </div>
        </Link>
    );
}
