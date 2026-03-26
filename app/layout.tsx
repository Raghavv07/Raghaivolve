import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Raghaivolve — AI Strategy Engine",
    description: "Autonomous AI solution engine for strategic planning and execution.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className={cn(inter.variable, "antialiased min-h-screen bg-background text-foreground")}>
                {children}
            </body>
        </html>
    );
}
