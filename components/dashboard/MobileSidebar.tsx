"use client";

import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileSidebar({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    // ...
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Header trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-black/80 backdrop-blur-md border-b border-white/10 h-16">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="ml-4 font-bold text-lg text-white tracking-tight">
                    Raghaivolve
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-[60] md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[70] w-72 bg-black border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <Sidebar user={user} />
            </div>
        </>
    );
}
