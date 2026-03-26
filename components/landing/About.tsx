import { Brain, Target, Zap } from "lucide-react";

export default function About() {
    return (
        <section id="about" className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Autonomous Problem Solving</h2>
                    <p className="text-lg text-muted-foreground">
                        Raghaivolve isn't just a planner. It's an interactive strategy engine that breaks down complex goals into executable steps, adapting to feedback in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Brain,
                            title: "Understand",
                            description: "Uses advanced LLMs to comprehend the nuance of your problem statement and context.",
                        },
                        {
                            icon: Target,
                            title: "Strategize",
                            description: "Decomposes high-level goals into granular, prioritized tasks with clear dependencies.",
                        },
                        {
                            icon: Zap,
                            title: "Execute",
                            description: "Provides actionable guidance, simulates outcomes, and replans as needed.",
                        },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                <item.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
