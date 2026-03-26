import { Terminal, GitPullRequest, Layers, BarChart3, ShieldCheck, Cpu } from "lucide-react";

const features = [
    {
        icon: Terminal,
        title: "Intelligent Understanding",
        description: "Parses natural language inputs to identify core problems and constraints instantly.",
    },
    {
        icon: GitPullRequest,
        title: "Task Decomposition",
        description: "Breaks complex projects into manageable, prioritized sub-tasks automatically.",
    },
    {
        icon: Layers,
        title: "Dynamic Roadmap",
        description: "Generates interactive timelines that adjust as you progress or requirements change.",
    },
    {
        icon: Cpu,
        title: "Execution Simulation",
        description: "Simulates potential outcomes of strategies before you commit resources.",
    },
    {
        icon: ShieldCheck,
        title: "Adaptive Replanning",
        description: "Continuously monitors progress and suggests course corrections for blockers.",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Visualizes productivity KPIs and strategy effectiveness in real-time.",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-primary font-semibold tracking-wider text-sm uppercase">Capabilities</span>
                    <h2 className="text-4xl md:text-6xl font-bold mt-3 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Engineered for Complexity
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        A complete suite of tools designed to turn ambiguity into clear, actionable strategy.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                <feature.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
