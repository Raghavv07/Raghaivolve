import PlanVisualization from "@/components/strategy/PlanVisualization";
import { getStrategy } from "@/lib/storage";

type Props = {
    params: Promise<{ id: string }>
}

export default async function StrategyPlanPage({ params }: Props) {
    const { id } = await params;
    console.log(`DEBUG_PAGE: Fetching strategy for ID: ${id}`);

    const strategy = await getStrategy(id);
    console.log(`DEBUG_PAGE: Strategy found?`, !!strategy);
    if (strategy) {
        console.log(`DEBUG_PAGE: Task count: ${strategy.tasks.length}`);
    }

    // Transform strategy tasks to Task interface if needed, or if types match roughly
    // The lib/megallm Task interface doesn't have 'id' which UI needs. We need to map it.
    // Transform strategy tasks to Task interface if needed
    const tasks = strategy?.tasks.map((t, i) => ({
        ...t,
        id: t.id || `task-${i}`, // Use existing ID or fallback
        duration: t.estimatedTime,
        status: t.status || "pending",
        why: t.rationale || "AI generated step for optimal execution",
        title: t.title,
        description: t.description,
        priority: t.priority
    })) || [];

    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <PlanVisualization
                id={id}
                initialTasks={tasks}
                initialSummary={strategy?.summary}
                initialTitle={strategy?.title}
                initialDuration={strategy?.estimatedDuration}
            />
        </div>
    );
}
