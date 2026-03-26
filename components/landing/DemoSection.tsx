"use client";

import { motion } from "framer-motion";

export default function DemoSection() {
    return (
        <section id="demo" className="py-24 md:py-40 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    <span className="text-accent font-semibold tracking-wider text-sm uppercase">Live Demo</span>
                    <h2 className="text-4xl md:text-6xl font-bold mt-4 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        See the Engine in Action
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
                        Watch how Raghaivolve decomposes a complex "Launch a new product" goal into a comprehensive 4-week timeline with 25+ distinct tasks.
                    </p>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left mb-12 bg-white/5 p-8 rounded-3xl border border-white/10">
                        {[
                            "Natural Language Input",
                            "Instant Strategy Decomposition",
                            "Resource Allocation Visualization",
                            "Export to Jira/Linear/Notion"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                <span className="text-lg text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button className="px-10 py-5 rounded-full bg-white text-black font-bold hover:bg-gray-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Try Interactive Playground
                    </button>

                </div>
            </div>
        </section>
    );
}
