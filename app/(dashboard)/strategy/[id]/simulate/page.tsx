import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SimulationView from "@/components/simulation/SimulationView";

export default async function SimulatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    return (
        <div className="container mx-auto py-8">
            <SimulationView strategyId={id} />
        </div>
    );
}
