import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import ActionsPageClient from "./ActionsPageClient";

export default async function ActionsPage() {
    const session = await getSession();
    if (!session) return null;

    const strategies = await db.strategies.findByUserId(session.id);
    const activeStrategies = strategies.filter(s => s.status === 'executing' || s.status === 'planned')
        .map(s => ({
            ...s,
            tasks: s.tasks?.map((t, i) => ({
                ...t,
                id: t.id || `temp-${s.id}-${i}`
            }))
        }));

    return <ActionsPageClient strategies={activeStrategies} />;
}
