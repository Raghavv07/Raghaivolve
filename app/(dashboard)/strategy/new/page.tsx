import StrategyInput from "@/components/strategy/StrategyInput";

export default function NewStrategyPage() {
    return (
        <div className="flex-1 p-6 md:p-8 pt-20 overflow-y-auto h-full bg-gradient-to-b from-black via-zinc-950 to-black">
            <div className="max-w-7xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
                <StrategyInput />
            </div>
        </div>
    );
}
