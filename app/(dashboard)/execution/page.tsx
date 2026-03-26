import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ExecutionView, { ExecutionTask } from "@/components/execution/ExecutionView";
import { StrategyTask as Task } from "@/lib/megallm";

export default async function ExecutionPage() {
    const session = await getSession();
    if (!session) return null;

    const strategies = await db.strategies.findByUserId(session.id);

    // Flatten tasks: Find all 'in-progress' tasks across all strategies
    const activeTasks: ExecutionTask[] = [];

    strategies.forEach(strategy => {
        // We need to cast because db.ts Strategy type definition is minimal but storage saves full object with tasks
        const fullStrategy = strategy as any;
        if (fullStrategy.tasks && Array.isArray(fullStrategy.tasks)) {
            fullStrategy.tasks.forEach((task: Task, index: number) => {
                if (task.status === 'in-progress') {
                    activeTasks.push({
                        task,
                        strategyId: strategy.id,
                        strategyTitle: strategy.title,
                        taskIndex: index
                    });
                }
            });
        }
    });

    return (
        <div className="container mx-auto max-w-4xl animate-in fade-in duration-500 p-6 md:p-8 pt-20">
            <ExecutionView tasks={activeTasks} />
        </div>
    );
}
