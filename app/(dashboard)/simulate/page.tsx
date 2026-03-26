import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SimulateHubPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const strategies = await db.strategies.findByUserId(session.id);

    return (
        <div className="container mx-auto py-10 max-w-6xl animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Simulation Hub</h1>
                    <p className="text-muted-foreground">Select a strategy to run AI simulations and debate.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {strategies.map((strategy) => (
                    <Link
                        key={strategy.id}
                        href={`/strategy/${strategy.id}/simulate`}
                        className="group relative p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 block"
                    >
                        <div className="absolute top-4 right-4 p-2 bg-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <BrainCircuit className="w-5 h-5 text-purple-400" />
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors line-clamp-1">
                            {strategy.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">
                            {strategy.tasksCount} tasks • {strategy.progress}% Complete
                        </p>

                        <div className="flex items-center text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                            <span>Launch Simulation</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}

                {strategies.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-muted-foreground mb-4">No strategies found to simulate.</p>
                        <Link href="/strategy/new" className="text-primary hover:underline">Create a Strategy first</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
