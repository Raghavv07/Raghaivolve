import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AnalyticsPage() {
    const session = await getSession();
    if (!session) return null;

    const strategies = await db.strategies.findByUserId(session.id);

    // Calculate Metrics
    const activeStrategies = strategies.filter(s => s.status === 'executing' || s.status === 'planned');
    const completedStrategies = strategies.filter(s => s.status === 'completed');

    const avgCompletion = strategies.length > 0
        ? Math.round(strategies.reduce((acc, s) => acc + s.progress, 0) / strategies.length)
        : 0;

    // Simple bottleneck logic: Count pending high priority tasks
    // In a real app, this would be more complex
    let highPriorityPending = 0;
    let mediumPriorityPending = 0;

    strategies.forEach(s => {
        // We need to fetch tasks, but db.strategies.findByUserId returns Strategy type which has tasksCount but not tasks array explicitly in type definition in db.ts?
        // Wait, db.ts Strategy type does NOT have tasks array. But storage.ts saves full plan.
        // Let's check if findByUserId actually returns full object. 
        // Based on storage.ts: "data.strategies[id] = { ...plan, ... }" so it saves everything.
        // But db.ts type definition might be incomplete. Casting to any for now to access tasks.
        const fullStrategy = s as any;
        if (fullStrategy.tasks) {
            highPriorityPending += fullStrategy.tasks.filter((t: any) => t.priority === 'high' && t.status !== 'completed').length;
            mediumPriorityPending += fullStrategy.tasks.filter((t: any) => t.priority === 'medium' && t.status !== 'completed').length;
        }
    });

    const stats = [
        { label: "Active Strategies", value: activeStrategies.length.toString(), change: "0", trend: "neutral" as const, iconName: "trending-up" as const },
        { label: "Avg. Completion", value: `${avgCompletion}%`, change: "0%", trend: "up" as const, iconName: "check" as const },
        { label: "Critical Tasks Pending", value: highPriorityPending.toString(), change: "0", trend: "down" as const, iconName: "alert" as const }, // Replaced "Bottlenecks"
        { label: "Total Strategies", value: strategies.length.toString(), change: "0", trend: "up" as const, iconName: "clock" as const }, // Replaced "Avg Time/Task"
    ];

    const bottlenecks = [
        { stage: "High Priority Pending", count: highPriorityPending, percentage: highPriorityPending > 0 ? 100 : 0 },
        { stage: "Medium Priority Pending", count: mediumPriorityPending, percentage: mediumPriorityPending > 0 ? (mediumPriorityPending / (highPriorityPending + mediumPriorityPending || 1)) * 100 : 0 },
    ];

    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <AnalyticsDashboard stats={stats} bottlenecks={bottlenecks} dailyActivity={[]} />
        </div>
    );
}
