"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ActionLogout() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/signin');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogout}>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign Out"}
            </button>
        </form>
    );
}
