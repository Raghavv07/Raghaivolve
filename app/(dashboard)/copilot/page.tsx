import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { Bot } from "lucide-react";
import ClientStrategyWrapper from "./ClientStrategyWrapper";

export default async function CopilotPage() {
    const session = await getSession();
    if (!session) return null;

    const strategies = await db.strategies.findByUserId(session.id);
    const activeStrategies = strategies.filter(s => s.status !== 'completed');

    return (
        <div className="flex-1 p-4 md:p-6 h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
                <ClientStrategyWrapper strategies={activeStrategies} />
            </div>
        </div>
    );
}
