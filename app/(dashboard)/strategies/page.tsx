import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import StrategyCard from "@/components/dashboard/StrategyCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EmptyState from "@/components/dashboard/EmptyState";

export default async function ActiveStrategiesPage() {
    const session = await getSession();
    if (!session) return null;

    const allStrategies = await db.strategies.findByUserId(session.id);
    const activeStrategies = allStrategies.filter(s => s.status !== 'completed');

    return (
        <div className="container mx-auto max-w-7xl animate-in fade-in duration-500 p-6 md:p-8 pt-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Active Strategies</h1>
                <p className="text-muted-foreground">Monitor and manage your ongoing strategic initiatives.</p>
            </div>

            {activeStrategies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeStrategies.map((strategy) => (
                        <StrategyCard key={strategy.id} strategy={strategy} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-muted-foreground mb-4">No active strategies found.</p>
                    <EmptyState />
                </div>
            )}
        </div>
    );
}
