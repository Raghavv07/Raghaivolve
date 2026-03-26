"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { Strategy } from "@/lib/db";
import { cn } from "@/lib/utils";
import { chatWithStrategyAction } from "@/app/actions";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface CopilotChatInterfaceProps {
    strategy: Strategy;
}

export default function CopilotChatInterface({ strategy }: CopilotChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load history from session storage on mount/strategy change
    useEffect(() => {
        const saved = sessionStorage.getItem(`chat_history_${strategy.id}`);
        if (saved) {
            setMessages(JSON.parse(saved));
        } else {
            setMessages([{
                id: "welcome",
                role: "assistant",
                content: `Hello! I'm your Strategy Copilot. I've analyzed **${strategy.title}** along with its **${strategy.tasksCount} tasks**. How can I help you execute or improve this plan today?`,
                timestamp: Date.now()
            }]);
        }
    }, [strategy.id]);

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem(`chat_history_${strategy.id}`, JSON.stringify(messages));
        }
    }, [messages, strategy.id]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare context for backend (last 10 messages)
            const history = [...messages, userMsg].slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const responseContent = await chatWithStrategyAction(strategy.id, history);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseContent,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "⚠️ I'm having trouble connecting to the strategy engine right now. Please try again in a moment.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            // Focus input again
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 border border-white/10 rounded-2xl bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
            {/* Header / Context Badge */}
            <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Context: <span className="text-white font-medium">{strategy.title}</span></span>
                </div>
                <button
                    onClick={() => {
                        if (confirm("Clear chat history for this strategy?")) {
                            setMessages([]);
                            sessionStorage.removeItem(`chat_history_${strategy.id}`);
                        }
                    }}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                    Clear Chat
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map(msg => (
                    <div key={msg.id} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                            msg.role === "assistant" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-zinc-800 border-white/10 text-zinc-400"
                        )}>
                            {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>

                        <div className={cn(
                            "flex-1 max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                            msg.role === "assistant" ? "bg-zinc-900/80 border border-white/5 text-zinc-300" : "bg-primary text-primary-foreground"
                        )}>
                            {msg.role === "assistant" ? (
                                <div className="markdown-prose">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-zinc-900/80 border-t border-white/10">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about tasks, risks, execution..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 text-center text-xs text-zinc-600">
                    AI can make mistakes. Review context before executing.
                </div>
            </form>
        </div>
    );
}
