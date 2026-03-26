import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import EmptyState from "@/components/dashboard/EmptyState";
import StrategyCard from "@/components/dashboard/StrategyCard";
import ActionLogout from "@/components/dashboard/ActionLogout";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) return null; // Middleware handles redirect, but safe guard

    const strategies = await db.strategies.findByUserId(session.id);

    return (
        <div className="container mx-auto max-w-7xl animate-in fade-in duration-500">
            <DashboardHeader userName={session.user_metadata?.full_name || session.email || "User"} />

            {strategies.length > 0 ? (
                <>
                    <StatsOverview strategies={strategies} />

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Your Strategies</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {strategies.map((strategy) => (
                                <StrategyCard key={strategy.id} strategy={strategy} />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState />
            )}


        </div>
    );
}
