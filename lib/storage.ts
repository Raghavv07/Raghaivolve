
import { StrategyPlan, StrategyTask } from './megallm';
import { db } from './db';

// Adapter to use Supabase via db.ts

export async function saveStrategy(plan: StrategyPlan, userId: string): Promise<string> {
    // StrategyPlan doesn't have ID, we need to create one.
    // Supabase generates UUIDs.

    // We construct the object expected by db.create
    const now = new Date().toISOString();
    const strategyData = {
        userId,
        title: plan.title,
        status: 'planned',
        progress: 0,
        tasksCount: plan.tasks ? plan.tasks.length : 0,
        summary: plan.summary,
        estimatedDuration: plan.estimatedDuration, // Save duration
        tasks: plan.tasks || [],
        versions: (plan.versions as any) || [],
    };

    const created = await db.strategies.create(strategyData);
    return created.id;
}

export async function getStrategy(id: string): Promise<StrategyPlan | null> {
    return await db.strategies.findById(id);
}

export async function updateStrategyTask(
    strategyId: string,
    taskIndex: number,
    updates: Partial<StrategyPlan['tasks'][0]>
): Promise<void> {
    const strategy = await db.strategies.findById(strategyId);
    if (!strategy) throw new Error("Strategy not found");

    if (!strategy.tasks || !strategy.tasks[taskIndex]) {
        throw new Error("Task not found");
    }

    // Update the task in memory
    strategy.tasks[taskIndex] = { ...strategy.tasks[taskIndex], ...updates };

    // Recalculate Strategy Progress
    const totalTasks = strategy.tasks.length;
    const completedTasks = strategy.tasks.filter((t: StrategyTask) => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update Strategy Status
    let status = strategy.status;
    if (progress === 100) {
        status = 'completed';
    } else if (progress > 0 || strategy.tasks.some((t: StrategyTask) => t.status === 'in-progress')) {
        status = 'executing';
    } else {
        status = 'planned';
    }

    // Save back to DB
    await db.strategies.update(strategyId, {
        tasks: strategy.tasks,
        progress,
        status,
        tasksCount: totalTasks
    });
}

export async function saveStrategyUpdates(id: string, updates: Partial<StrategyPlan>): Promise<void> {
    await db.strategies.update(id, updates);
}

export async function archiveCurrentVersion(id: string, changeDescription: string): Promise<void> {
    const strategy = await db.strategies.findById(id);
    if (!strategy) throw new Error("Strategy not found");

    const snapshot = { ...strategy };
    delete snapshot.versions; // Don't nest versions

    const versions = strategy.versions || [];
    versions.push({
        timestamp: new Date().toISOString(),
        changes: changeDescription,
        plan: snapshot
    });

    await db.strategies.update(id, { versions });
}

export async function deleteStrategy(id: string): Promise<void> {
    await db.strategies.delete(id);
}
