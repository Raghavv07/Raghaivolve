import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoSection from "@/components/landing/DemoSection";
import UseCases from "@/components/landing/UseCases";
import Testimonials from "@/components/landing/Testimonials";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <Hero />
            <About />
            <Features />
            <HowItWorks />
            <DemoSection />
            <UseCases />
            <Testimonials />
        </main>
    );
}
