"use server";

import { generateStrategy, refineTask, decomposeTask, explainTask, analyzeRisks, RiskAnalysis } from "@/lib/megallm";
import { saveStrategy, updateStrategyTask, getStrategy, saveStrategyUpdates } from "@/lib/storage";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function isRedirectError(error: any) {
    return error?.digest?.startsWith?.('NEXT_REDIRECT');
}

export async function createStrategyAction(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: "You must be logged in to create a strategy." };
    }

    const problem = formData.get("problem") as string;
    const deadline = formData.get("deadline") as string;
    const urgency = formData.get("urgency") as string;
    const resources = formData.get("resources") as string;

    if (!problem) {
        return { error: "Problem description is required." };
    }

    try {
        // 1. Generate via AI
        console.log("DEBUG: Calling generateStrategy...");
        const plan = await generateStrategy(problem, {
            deadline,
            urgency,
            resources
        });
        console.log("DEBUG: AI Response received:", JSON.stringify(plan, null, 2));

        // 2. Save to "DB"
        const id = await saveStrategy(plan, session.id);
        console.log("DEBUG: Strategy saved with ID:", id);

        // 3. Redirect (This will throw a NEXT_REDIRECT error which is expected/handled by Next.js)
        redirect(`/strategy/${id}/plan`);
    } catch (error) {
        // Re-throw redirect errors so Next.js handles them
        if (isRedirectError(error)) {
            throw error;
        }
        console.error("Strategy generation failed:", error);

        // Return user-friendly error messages
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
            return {
                error: "The AI is taking longer than expected to generate your strategy. This might be due to high complexity. Please try again or simplify your problem statement."
            };
        } else if (
            errorMessage.includes("503") ||
            errorMessage.toLowerCase().includes("service unavailable") ||
            errorMessage.toLowerCase().includes("temporarily unavailable")
        ) {
            return {
                error: "The AI provider is temporarily unavailable (503). Please wait 30-60 seconds and try again."
            };
        } else if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
            return {
                error: "Authentication failed with the AI service. Please contact support."
            };
        } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
            return {
                error: "Too many requests. Please wait a moment and try again."
            };
        } else {
            return {
                error: `Failed to generate strategy: ${errorMessage}. Please try again or contact support if the issue persists.`
            };
        }
    }
}

export async function updateTaskStatusAction(strategyId: string, taskIndex: number, newStatus: "pending" | "in-progress" | "completed") {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy || !strategy.tasks[taskIndex]) {
            throw new Error("Task not found");
        }

        let task = strategy.tasks[taskIndex];

        // If starting task, generate sub-steps if missing
        if (newStatus === "in-progress" && (!task.subSteps || task.subSteps.length === 0)) {
            console.log("DEBUG: Decomposing task on start...");
            let subStepTitles = await decomposeTask(task);

            // Critical Fallback if AI fails or returns empty
            if (!subStepTitles || subStepTitles.length === 0) {
                console.log("DEBUG: No sub-steps generated.");
                subStepTitles = [];
            }

            task = {
                ...task,
                subSteps: subStepTitles.map(title => ({ title, isCompleted: false }))
            };
        }

        task.status = newStatus;
        await updateStrategyTask(strategyId, taskIndex, task);
        revalidatePath(`/strategy/${strategyId}/plan`);
        revalidatePath('/dashboard'); // Update dashboard progress
        return task;
    } catch (error) {
        console.error("Failed to update task status:", error);
        throw new Error("Failed to update task status");
    }
}

export async function refineTaskAction(strategyId: string, taskIndex: number) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy || !strategy.tasks[taskIndex]) {
            throw new Error("Strategy or task not found");
        }

        const task = strategy.tasks[taskIndex];
        const context = `Overall Strategy: ${strategy.summary}\nRefining Task: ${task.title}`;

        console.log("DEBUG: Refining task...", task.title);
        const refinedTask = await refineTask(task, context);

        // Preserve status/dependencies if AI doesn't return them or returns defaults
        const updatedTask = {
            ...task,
            ...refinedTask,
            status: task.status, // Keep existing status
            dependencies: task.dependencies // Keep existing dependencies
        };

        revalidatePath(`/strategy/${strategyId}/plan`);
        revalidatePath('/dashboard'); // Update dashboard for any metadata changes
        return updatedTask;
    } catch (error) {
        console.error("Failed to refine task:", error);
        throw new Error("Failed to refine task");
    }
}

export async function toggleSubStepAction(strategyId: string, taskIndex: number, stepIndex: number) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy || !strategy.tasks[taskIndex]) {
            throw new Error("Strategy or task not found");
        }

        const task = strategy.tasks[taskIndex];
        if (!task.subSteps || !task.subSteps[stepIndex]) {
            throw new Error("Sub-step not found");
        }

        // Toggle status
        task.subSteps[stepIndex].isCompleted = !task.subSteps[stepIndex].isCompleted;

        await updateStrategyTask(strategyId, taskIndex, task);
        revalidatePath(`/strategy/${strategyId}/plan`);
        revalidatePath('/dashboard'); // Update dashboard progress
        revalidatePath('/dashboard'); // Update dashboard progress
        return task;
    } catch (error) {
        console.error("Failed to toggle sub-step:", error);
        throw new Error("Failed to toggle sub-step");
    }
}

export async function explainTaskAction(strategyId: string, taskIndex: number) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy || !strategy.tasks[taskIndex]) {
            throw new Error("Strategy or task not found");
        }

        let task = strategy.tasks[taskIndex];

        // Return cached explanation if exists
        if (task.aiReasoning) {
            return task;
        }

        const context = `Overall Strategy: ${strategy.summary}`;
        console.log("DEBUG: Explaining task...", task.title);

        const reasoning = await explainTask(task, context);

        // Update task with new reasoning
        task = {
            ...task,
            aiReasoning: reasoning
        };

        await updateStrategyTask(strategyId, taskIndex, task);
        // No need to revalidate path aggressively here as it's a local state update mostly, 
        // but to persist it across reloads we save it.
        // We'll return the updated task and let the client update its state.

        return task;
    } catch (error) {
        console.error("Failed to explain task:", error);
        throw new Error("Failed to explain task");
    }
}

export async function analyzeRisksAction(strategyId: string) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        console.log("DEBUG: Analyzing risks for strategy:", strategyId);
        const analysis = await analyzeRisks(strategy);

        for (const risk of analysis.risks) {
            if (strategy.tasks[risk.taskIndex]) {
                strategy.tasks[risk.taskIndex] = {
                    ...strategy.tasks[risk.taskIndex],
                    riskLevel: risk.riskLevel,
                    riskReason: risk.reason
                };
            }
        }

        const strategyWithAnalysis = {
            ...strategy,
            analysis: {
                bottlenecks: analysis.bottlenecks,
                lastRun: new Date().toISOString()
            }
        };

        const { saveStrategyUpdates } = await import("@/lib/storage");
        await saveStrategyUpdates(strategyId, strategyWithAnalysis);

        revalidatePath(`/strategy/${strategyId}/plan`);
        return analysis;
    } catch (error) {
        console.error("Failed to analyze risks:", error);
        throw new Error("Failed to analyze risks");
    }
}

export async function replanStrategyAction(strategyId: string, event: { type: "delay" | "skip" | "constraint", detail: string }) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        const { replanStrategy } = await import("@/lib/megallm");
        console.log("DEBUG: Replanning strategy:", strategyId, event);

        const refinedPlan = await replanStrategy(strategy, event);
        return refinedPlan; // Return proposed plan, don't save yet
    } catch (error) {
        console.error("Failed to replan strategy:", error);
        throw new Error("Failed to replan strategy");
    }
}

export async function acceptPlanAction(strategyId: string, newPlan: any, reason: string) {
    try {
        const { archiveCurrentVersion, saveStrategyUpdates } = await import("@/lib/storage");

        // 1. Archive current
        await archiveCurrentVersion(strategyId, reason);

        // 2. Update with new plan
        // We only want to update tasks and maybe summary/title if changed.
        await saveStrategyUpdates(strategyId, {
            tasks: newPlan.tasks,
            title: newPlan.title, // Optional if AI changed it
            summary: newPlan.summary // Optional
        });

        revalidatePath(`/strategy/${strategyId}/plan`);
    } catch (error) {
        console.error("Failed to accept plan:", error);
        throw new Error("Failed to accept plan");
    }
}

export async function getNextBestActionAction(strategyId: string) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        const { suggestNextBestAction } = await import("@/lib/megallm");
        const suggestion = await suggestNextBestAction(strategy);
        return suggestion;
    } catch (error) {
        console.error("Failed to get next best action:", error);
        return {
            taskId: "",
            reason: "Unable to compute next best action from AI right now. Continue with the top pending task."
        };
    }
}

export async function getConfidenceScoreAction(strategyId: string) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        const { evaluateConfidence } = await import("@/lib/megallm");
        const confidence = await evaluateConfidence(strategy);
        return confidence;
    } catch (error) {
        console.error("Failed to get confidence score:", error);
        return {
            score: 70,
            factors: [{ label: "AI unavailable", impact: "neutral" }]
        };
    }
}

export async function getAnalyticsInsightsAction(metrics: any) {
    try {
        const { generateAnalyticsInsights } = await import("@/lib/megallm");
        const insights = await generateAnalyticsInsights(metrics);
        return insights;
    } catch (error) {
        console.error("Failed to get analytics insights:", error);
        return null;
    }
}

export async function deleteStrategyAction(id: string) {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    try {
        const { deleteStrategy } = await import("@/lib/storage");
        await deleteStrategy(id);
        revalidatePath("/dashboard");
        revalidatePath("/");
    } catch (error) {
        console.error("Failed to delete strategy:", error);
        throw new Error("Failed to delete strategy");
    }
}

// ... existing actions


export async function traceDecisionsAction(strategyId: string, taskId: string) {
    try {
        let strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        let strategiesModified = false;

        // 1. Sanitize Strategy: Ensure all tasks have IDs
        strategy.tasks = strategy.tasks.map(t => {
            if (!t.id) {
                strategiesModified = true;
                return { ...t, id: Math.random().toString(36).substring(7) };
            }
            return t;
        });

        // 2. Try to find the task
        let task = strategy.tasks.find(t => t.id === taskId);

        // 3. Fallback: If not found, try to parse index from temp ID
        if (!task && typeof taskId === 'string' && taskId.startsWith("temp-")) {
            console.log("DEBUG_TRACE: Attempting fallback for temp ID");
            const match = taskId.match(/temp-(\d+)-/);
            if (match && match[1]) {
                const index = parseInt(match[1], 10);
                if (!isNaN(index) && strategy.tasks[index]) {
                    console.log(`DEBUG_TRACE: Found task by index: ${index}`);
                    task = strategy.tasks[index];
                    // If we found it by index, it means the Client used a temp ID (index based)
                    // but on the server we might have just assigned it a random ID in step 1.
                    // Or it might have had a DIFFERENT random ID from a previous run.
                    // We should trust the index mapping from the client for "temp-" IDs.
                }
            }
        }

        if (!task) {
            console.error(`DEBUG_TRACE: Task not found. ID: ${taskId}`);
            console.error(`DEBUG_TRACE: Available Indices: ${strategy.tasks.map((_, i) => i).join(',')}`);
            throw new Error("Task not found");
        }

        // 4. Save sanitized IDs if needed (before long-running AI op)
        if (strategiesModified) {
            console.log("DEBUG_TRACE: Saving strategy with sanitized IDs...");
            const { saveStrategyUpdates } = await import("@/lib/storage");
            await saveStrategyUpdates(strategyId, { tasks: strategy.tasks });
        }

        // const { traceDecisions } = await import("@/lib/megallm");
        // const context = `Strategy: ${strategy.title}. Summary: ${strategy.summary}`;
        // const decisionContext = await traceDecisions(task, context);

        // MOCK DATA (User Requested bypass of AI)
        const decisionContext = {
            reason: task.rationale || "Selected based on standard strategic patterns for this objective.",
            alternatives: [
                "Alternative A: Execute sequentially (slower but safer)",
                "Alternative B: Outsource to external team (faster but costly)"
            ],
            tradeoffs: "The chosen path offers the best balance of resource efficiency and execution speed given the project constraints."
        };

        // 5. Update task with result
        // We need to find the task again in the strategy object (it's ref, but let's be safe)
        // or just update the task object we have reference to, since we save the whole array.
        task.decisionContext = decisionContext;

        const { saveStrategyUpdates } = await import("@/lib/storage");
        await saveStrategyUpdates(strategyId, { tasks: strategy.tasks });

        revalidatePath(`/strategy/${strategyId}`);

        return decisionContext;
    } catch (error) {
        console.error("Failed to trace decisions:", error);
        throw error;
    }
}


export async function getSimulationAction(strategyId: string) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");
        const { simulateScenarios } = await import("@/lib/megallm");
        return await simulateScenarios(strategy);
    } catch (error) {
        console.error("Failed to simulate:", error);
        return null;
    }
}

export async function runDebateAction(strategyId: string) {
    try {
        const strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");
        const { runMultiAgentDebate } = await import("@/lib/megallm");
        return await runMultiAgentDebate(strategy);
    } catch (error) {
        console.error("Failed to run debate:", error);
        return null;
    }
}

export async function chatWithStrategyAction(strategyId: string, messages: any[]) {
    try {
        let strategy = await getStrategy(strategyId);
        if (!strategy) throw new Error("Strategy not found");

        const { chatWithStrategy } = await import("@/lib/megallm");
        // Cast DB strategy to StrategyPlan if needed, or ensure types align
        // The DB strategy has more fields but should satisfy StrategyPlan requirements
        const response = await chatWithStrategy(strategy as any, messages);
        return response;
    } catch (error) {
        console.error("Failed to chat with strategy:", error);
        throw new Error("Failed to process chat message");
    }
}
