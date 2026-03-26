
import { createClient } from '@/lib/supabase/server';
import { StrategyTask } from './megallm';

export type Strategy = {
    id: string;
    userId: string;
    title: string;
    estimatedDuration: string; // New field
    status: 'planned' | 'executing' | 'completed';
    progress: number;
    tasksCount: number;
    createdAt: string;
    lastUpdated: string;
    summary: string;
    tasks: StrategyTask[];
    versions?: any[];
    analysis?: any;
};

function mapStrategy(data: any): Strategy {
    return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        estimatedDuration: data.estimated_duration || "Unknown",
        status: data.status,
        progress: data.progress,
        tasksCount: data.tasks_count,
        summary: data.summary || "",
        tasks: data.tasks || [],
        versions: data.versions || [],
        analysis: data.analysis || null,
        createdAt: data.created_at,
        lastUpdated: data.last_updated
    };
}

export const db = {
    users: {
        findByEmail: async (email: string) => {
            return null;
        }
    },
    strategies: {
        findMany: async () => {
            const supabase = await createClient();
            const { data, error } = await supabase.from('strategies').select('*').order('last_updated', { ascending: false });
            if (error) throw error;
            return data.map(mapStrategy);
        },
        findByUserId: async (userId: string) => {
            const supabase = await createClient();
            const { data, error } = await supabase.from('strategies').select('*').eq('user_id', userId).order('last_updated', { ascending: false });
            if (error) {
                console.error("Error fetching strategies:", error);
                return [];
            }
            return data.map(mapStrategy);
        },
        findById: async (id: string) => {
            const supabase = await createClient();
            const { data, error } = await supabase.from('strategies').select('*').eq('id', id).single();
            if (error) return null;
            return mapStrategy(data);
        },
        create: async (strategy: any) => {
            const supabase = await createClient();

            const dbPayload: any = {
                user_id: strategy.userId,
                title: strategy.title,
                estimated_duration: strategy.estimatedDuration, // Map to Snake Case
                status: strategy.status,
                progress: strategy.progress,
                tasks_count: strategy.tasksCount,
                summary: strategy.summary,
                tasks: strategy.tasks,
                versions: strategy.versions || [],
                analysis: strategy.analysis || null,
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            };

            if (strategy.id) {
                dbPayload.id = strategy.id;
            }

            const { data, error } = await supabase.from('strategies').insert(dbPayload).select().single();
            if (error) throw error;
            return mapStrategy(data);
        },
        update: async (id: string, updates: any) => {
            const supabase = await createClient();
            const dbUpdates: any = {};
            if (updates.title) dbUpdates.title = updates.title;
            if (updates.estimatedDuration) dbUpdates.estimated_duration = updates.estimatedDuration;
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
            if (updates.tasksCount !== undefined) dbUpdates.tasks_count = updates.tasksCount;
            if (updates.summary) dbUpdates.summary = updates.summary;
            if (updates.tasks) dbUpdates.tasks = updates.tasks;
            if (updates.versions) dbUpdates.versions = updates.versions;
            if (updates.analysis) dbUpdates.analysis = updates.analysis;

            dbUpdates.last_updated = new Date().toISOString();

            const { data, error } = await supabase.from('strategies').update(dbUpdates).eq('id', id).select().single();
            if (error) throw error;
            return mapStrategy(data);
        },
        delete: async (id: string) => {
            const supabase = await createClient();
            const { error } = await supabase.from('strategies').delete().eq('id', id);
            if (error) throw error;
        }
    }
};
