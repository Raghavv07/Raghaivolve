
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar user={session || { name: 'Guest', email: '' }} />
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar user={session || { name: 'Guest', email: '' }} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen p-4 md:p-10 relative mt-16 md:mt-0">
                {/* Background Gradients for Dashboard Area */}
                <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10 translate-y-[-50%]" />

                {children}
            </main>
        </div>
    );
}
