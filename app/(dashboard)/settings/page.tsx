"use client";

import { motion } from "framer-motion";
import {
    User,
    Bell,
    Moon,
    Shield,
    Smartphone,
    Mail,
    Slack,
    Zap,
    Clock,
    Layout
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [planningStyle, setPlanningStyle] = useState("balanced");
    const [theme, setTheme] = useState("dark");
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        slack: true
    });

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    // ... existing render ...

    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* ... existing header ... */}

                {/* Profile Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-6"
                >
                    {loading ? (
                        <div className="animate-pulse flex items-center gap-6 w-full">
                            <div className="w-20 h-20 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-3">
                                <div className="h-6 w-1/3 bg-white/10 rounded" />
                                <div className="h-4 w-1/4 bg-white/10 rounded" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/20">
                                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-white">
                                    {user?.user_metadata?.full_name || "User"}
                                </h2>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <div className="flex gap-2 mt-3">
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                        Edit Profile
                                    </button>
                                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>


                {/* AI Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6"
                >
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        AI Planning Style
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: "aggressive", label: "Aggressive", desc: "Tight deadlines, high velocity", icon: Zap },
                            { id: "balanced", label: "Balanced", desc: "Sustainable pace, moderate buffers", icon: Layout },
                            { id: "relaxed", label: "Relaxed", desc: "Generous buffers, low stress", icon: Clock },
                        ].map((style) => (
                            <button
                                key={style.id}
                                onClick={() => setPlanningStyle(style.id)}
                                className={cn(
                                    "p-4 rounded-xl border text-left transition-all duration-200",
                                    planningStyle === style.id
                                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                        : "bg-black/20 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <style.icon className="w-6 h-6 mb-3" />
                                <div className="font-semibold mb-1">{style.label}</div>
                                <div className="text-xs opacity-70">{style.desc}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications & Theme */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6"
                    >
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-400" />
                            Notifications
                        </h2>

                        <div className="space-y-4">
                            {[
                                { id: "email", label: "Email Digest", icon: Mail },
                                { id: "push", label: "Mobile Push", icon: Smartphone },
                                { id: "slack", label: "Slack Integration", icon: Slack },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-white">{item.label}</span>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                                        className={cn(
                                            "w-10 h-6 rounded-full relative transition-colors duration-200",
                                            notifications[item.id as keyof typeof notifications] ? "bg-primary" : "bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                            notifications[item.id as keyof typeof notifications] ? "translate-x-4" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6"
                    >
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Moon className="w-5 h-5 text-purple-400" />
                            Appearance
                        </h2>

                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-white">Dark Mode</span>
                                <span className="text-xs text-muted-foreground">(Recommended)</span>
                            </div>
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className={cn(
                                    "w-10 h-6 rounded-full relative transition-colors duration-200",
                                    theme === "dark" ? "bg-primary" : "bg-white/10"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                                    theme === "dark" ? "translate-x-4" : "translate-x-0"
                                )} />
                            </button>
                        </div>

                        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-white mb-1">Data Privacy</div>
                                    <p className="text-xs text-muted-foreground">
                                        Your strategies are encrypted end-to-end. We do not train our public models on your proprietary data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
