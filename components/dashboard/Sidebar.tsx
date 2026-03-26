
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Plus,
    ListTodo,
    Play,
    BarChart3,
    Settings,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    BrainCircuit,
    User,
    Sparkles,
    Zap,
    Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Create Strategy", href: "/strategy/new", icon: Plus },
    { name: "Active Strategies", href: "/strategies", icon: ListTodo },
    { name: "Strategy Copilot", href: "/copilot", icon: Bot },
    { name: "Simulate Strategy", href: "/simulate", icon: Sparkles },
    { name: "Action Connectors", href: "/actions", icon: Zap },
    { name: "Execution", href: "/execution", icon: Play },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryItems = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help & Docs", href: "/help", icon: HelpCircle },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/signin');
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside
            className={cn(
                "sticky top-0 left-0 z-40 h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 flex flex-col",
                isCollapsed ? "w-[80px]" : "w-[280px]"
            )}
        >
            {/* 1. Brand Section */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 relative">
                <div className="flex items-center gap-3 overflow-hidden mt-2">
                    <div className="min-w-[32px] w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-primary" />
                    </div>
                    <div className={cn("transition-opacity duration-300 min-w-[200px] mt-2", isCollapsed ? "opacity-0" : "opacity-100")}>
                        <h1 className="font-bold text-lg leading-none tracking-tight">Raghaivolve</h1>
                        <p className="text-[10px] text-primary uppercase tracking-wider font-semibold mt-0.5">Strategy Engine</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-primary transition-colors backdrop-blur-md shadow-lg"
                >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </div>

            {/* 2. Navigation */}
            <div className="flex-1 py-6 px-3 space-y-8 overflow-y-auto scrollbar-hide overflow-x-hidden">
                <div className="space-y-1">
                    <div className={cn("px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-opacity", isCollapsed && "opacity-0 invisible")}>
                        Main
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                                <span className={cn("whitespace-nowrap transition-all duration-300", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
                                    {item.name}
                                </span>
                                {isActive && !isCollapsed && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.8)]" />
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover border border-white/10 text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="space-y-1">
                    <div className={cn("px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-opacity", isCollapsed && "opacity-0 invisible")}>
                        Support
                    </div>
                    {secondaryItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-muted-foreground hover:text-white hover:bg-white/5",
                                pathname === item.href && "bg-white/5 text-white"
                            )}
                        >
                            <item.icon className="w-5 h-5 min-w-[20px]" />
                            <span className={cn("whitespace-nowrap transition-all duration-300", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
                                {item.name}
                            </span>
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-popover border border-white/10 text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* 4. User Section */}
            <div className="p-3 border-t border-white/5 mt-auto">
                <div
                    className={cn(
                        "flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative",
                        isCollapsed && "justify-center p-2"
                    )}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-black/50">
                        {user.name?.[0] || <User className="w-4 h-4" />}
                    </div>

                    <div className={cn("flex-1 overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                        <div className="text-sm font-medium truncate text-white">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-popover border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
