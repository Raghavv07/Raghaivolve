
import { type Strategy } from "@/lib/db";
import { CircleDashed, Play, CheckCircle2 } from "lucide-react";

export default function StatsOverview({ strategies }: { strategies: Strategy[] }) {
    const planned = strategies.filter(s => s.status === 'planned').length;
    const executing = strategies.filter(s => s.status === 'executing').length;
    const completed = strategies.filter(s => s.status === 'completed').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatItem label="Planned" value={planned} icon={CircleDashed} color="text-slate-400" />
            <StatItem label="Executing" value={executing} icon={Play} color="text-blue-400" />
            <StatItem label="Completed" value={completed} icon={CheckCircle2} color="text-green-400" />
        </div>
    );
}

function StatItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <div className="text-2xl font-bold leading-none mb-1">{value}</div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</div>
            </div>
        </div>
    );
}
