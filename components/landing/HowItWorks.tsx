"use client";

import { motion } from "framer-motion";
import { MessageSquare, Cpu, Workflow, CheckCircle2 } from "lucide-react";

const steps = [
    {
        icon: MessageSquare,
        title: "Input Context",
        description: "Describe your goal or problem in natural language. Raghaivolve parses constraints, timelines, and resources.",
    },
    {
        icon: Cpu,
        title: "AI Analysis",
        description: "Our engine decomposes the problem into logical sub-tasks, identifying dependencies and critical paths.",
    },
    {
        icon: Workflow,
        title: "Plan Generation",
        description: "Receive a dynamic, step-by-step action plan with assigned priorities and estimated durations.",
    },
    {
        icon: CheckCircle2,
        title: "Execute & Adapt",
        description: "Follow the roadmap. As you complete tasks or hit blockers, the AI replans in real-time.",
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-primary font-semibold tracking-wider text-sm uppercase">Workflow</span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">From Chaos to Clarity</h2>
                    <p className="text-lg text-muted-foreground">
                        A seamless pipeline that transforms abstract challenges into concrete results.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative group transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <step.icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg group-hover:bg-accent transition-colors">
                                        {index + 1}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-sm text-muted-foreground px-4">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
