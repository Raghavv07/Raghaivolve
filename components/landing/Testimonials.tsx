import { Quote } from "lucide-react";

const testimonials = [
    {
        quote: "Raghaivolve cut our project planning time by 90%. It understands context in a way no other tool does.",
        author: "Sarah Chen",
        role: "CTO at TechFlow",
    },
    {
        quote: "The dynamic roadmap generation is a game changer. We pivoted our strategy and the plan updated instantly.",
        author: "Marcus Johnson",
        role: "Product Lead",
    },
    {
        quote: "Finally, an AI that doesn't just chat, but actually structures work. Incredible for complex hackathons.",
        author: "Alex Rivera",
        role: "Hackathon Winner",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Trusted by Builders</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 relative">
                            <Quote className="w-8 h-8 text-primary/40 mb-4" />
                            <p className="text-lg italic text-muted-foreground mb-6">"{t.quote}"</p>
                            <div>
                                <p className="font-bold text-foreground">{t.author}</p>
                                <p className="text-sm text-primary">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
