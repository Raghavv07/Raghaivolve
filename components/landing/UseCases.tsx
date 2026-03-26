import { GraduationCap, Briefcase, Building2, Rocket } from "lucide-react";

const useCases = [
    {
        icon: Rocket,
        title: "Startup Founders",
        description: "Go from 'I have an idea' to a complete MVP roadmap in minutes, not weeks.",
        tags: ["Product Management", "Speed"]
    },
    {
        icon: Briefcase,
        title: "Project Managers",
        description: "Instantly generate Gantt charts and dependency trees for complex enterprise projects.",
        tags: ["Enterprise", "Planning"]
    },
    {
        icon: GraduationCap,
        title: "Students & Researchers",
        description: "Break down massive thesis projects or study plans into manageable daily tasks.",
        tags: ["Education", "Productivity"]
    },
    {
        icon: Building2,
        title: "Local Government",
        description: "Plan smart city initiatives or community events with resource-aware scheduling.",
        tags: ["Public Sector", "Logistics"]
    }
];

export default function UseCases() {
    return (
        <section id="use-cases" className="py-20 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Visionaries</h2>
                    <p className="text-lg text-muted-foreground">
                        Whether you're building a company or a community, Raghaivolve scales to your ambition.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {useCases.map((useCase, index) => (
                        <div key={index} className="group flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm">
                            <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <useCase.icon className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">{useCase.title}</h3>
                                <p className="text-muted-foreground mb-5 leading-relaxed">{useCase.description}</p>
                                <div className="flex gap-2">
                                    {useCase.tags.map(tag => (
                                        <span key={tag} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/70 border border-white/5 font-medium group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/20 transition-all">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
