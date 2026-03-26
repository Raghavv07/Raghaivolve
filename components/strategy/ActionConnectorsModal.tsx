"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    ListTodo,
    Mail,
    FileText,
    Download,
    Copy,
    CheckCircle2,
    CheckSquare,
    Square
} from "lucide-react";
import { StrategyTask } from "@/lib/megallm";
import { cn } from "@/lib/utils";

interface ActionConnectorsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: StrategyTask[];
    strategyTitle: string;
}

type ExportType = 'calendar' | 'tasks' | 'email' | 'doc';

export default function ActionConnectorsModal({ isOpen, onClose, tasks, strategyTitle }: ActionConnectorsModalProps) {
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<ExportType>('calendar');
    const [previewContent, setPreviewContent] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Auto-select all tasks on open
    useEffect(() => {
        if (isOpen) {
            setSelectedTaskIds(tasks.map(t => t.id));
        }
    }, [isOpen, tasks]);

    // Generate Preview
    useEffect(() => {
        const selected = tasks.filter(t => selectedTaskIds.includes(t.id));
        if (selected.length === 0) {
            setPreviewContent("Please select at least one task to generate a preview.");
            return;
        }

        let content = "";
        switch (activeTab) {
            case 'calendar':
                content = `Beginning export of ${selected.length} events to Calendar...\n\n`;
                selected.forEach((t, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + (i * 2) + 1); // Mock scheduling
                    content += `Event: ${t.title}\n`;
                    content += `Date: ${date.toLocaleDateString()} at 9:00 AM\n`;
                    content += `Duration: 2 hours\n`;
                    content += `Notes: ${t.description}\n`;
                    content += `----------------------------------------\n`;
                });
                break;
            case 'tasks':
                content = `${strategyTitle} - Action Items\n\n`;
                selected.forEach(t => {
                    content += `[ ] ${t.title} (${t.priority.toUpperCase()})\n`;
                    content += `    Due: ${t.estimatedTime}\n`;
                });
                break;
            case 'email':
                content = `Subject: Updated Action Plan for ${strategyTitle}\n\n`;
                content += `Team,\n\nHere are the critical next steps we need to execute for the "${strategyTitle}" initiative:\n\n`;
                selected.forEach(t => {
                    content += `• ${t.title}\n  Context: ${t.description}\n  Priority: ${t.priority}\n\n`;
                });
                content += `Please review these items and confirm ownership by EOD.\n\nBest,\n[Your Name]`;
                break;
            case 'doc':
                content = `# ${strategyTitle}\n\n## Executive Summary\nImplementation plan focusing on ${selected.length} key action items.\n\n## Action Plan\n\n`;
                selected.forEach((t, i) => {
                    content += `### ${i + 1}. ${t.title}\n`;
                    content += `**Status**: ${t.status || 'Pending'}\n`;
                    content += `**Rationale**: ${t.rationale}\n`;
                    content += `**Dependencies**: ${t.dependencies?.join(", ") || "None"}\n\n`;
                });
                break;
        }
        setPreviewContent(content);
    }, [selectedTaskIds, activeTab, tasks, strategyTitle]);

    const toggleTask = (id: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate API/Processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (activeTab === 'calendar') {
            // Simulate .ics download
            const blob = new Blob([previewContent], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `actions-${Date.now()}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // Copy to clipboard for others
            navigator.clipboard.writeText(previewContent);
        }

        setIsExporting(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-4xl h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden"
                >
                    {/* Left Sidebar: Task Selection */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-zinc-900/30">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Select Tasks</h3>
                            <button
                                onClick={() => setSelectedTaskIds(tasks.map(t => t.id))}
                                className="text-xs text-primary hover:text-primary/80"
                            >
                                Select All
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    className={cn(
                                        "p-3 rounded-lg cursor-pointer flex items-start gap-3 transition-colors",
                                        selectedTaskIds.includes(task.id) ? "bg-primary/10" : "hover:bg-white/5"
                                    )}
                                >
                                    {selectedTaskIds.includes(task.id)
                                        ? <CheckSquare className="w-4 h-4 text-primary mt-1 shrink-0" />
                                        : <Square className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                                    }
                                    <div>
                                        <div className={cn("text-sm font-medium", selectedTaskIds.includes(task.id) ? "text-white" : "text-muted-foreground")}>
                                            {task.title}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1 line-clamp-1">{task.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content: Export Config & Preview */}
                    <div className="flex-1 flex flex-col bg-[#0A0A0A]">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Export Actions
                                    <span className="text-xs font-normal text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                        {selectedTaskIds.length} Selected
                                    </span>
                                </h2>
                            </div>
                            <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            {[
                                { id: 'calendar', label: 'Calendar', icon: Calendar },
                                { id: 'tasks', label: 'Task List', icon: ListTodo },
                                { id: 'email', label: 'Email Draft', icon: Mail },
                                { id: 'doc', label: 'Planning Doc', icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as ExportType)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === tab.id
                                            ? "border-primary text-primary bg-primary/5"
                                            : "border-transparent text-muted-foreground hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 p-6 overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-medium text-white">Preview</h3>
                                <div className="text-xs text-zinc-500">
                                    {activeTab === 'calendar' ? 'Events will be spaced out automatically' : 'Generated from template'}
                                </div>
                            </div>
                            <div className="flex-1 bg-zinc-900/50 rounded-xl border border-white/10 p-4 overflow-y-auto font-mono text-sm text-zinc-300 whitespace-pre-wrap">
                                {previewContent}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end items-center gap-3 bg-zinc-900/30">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting || selectedTaskIds.length === 0}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg",
                                    showSuccess
                                        ? "bg-green-500 text-white shadow-green-500/20"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
                                    (isExporting || selectedTaskIds.length === 0) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {showSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        {activeTab === 'calendar' ? 'Downloaded!' : 'Copied!'}
                                    </>
                                ) : (
                                    <>
                                        {activeTab === 'calendar' || activeTab === 'doc' ? <Download className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {activeTab === 'calendar' ? 'Download .ics' : 'Copy to Clipboard'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
