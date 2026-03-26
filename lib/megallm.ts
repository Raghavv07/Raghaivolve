import OpenAI from "openai";

const apiKey = process.env.MEGALLM_API_KEY;
const groqApiKey = process.env.GROQ_API_KEY;
const hasUsableGroqApiKey = Boolean(
    groqApiKey &&
    !groqApiKey.startsWith("your_") &&
    !groqApiKey.includes("placeholder")
);

if (!apiKey) {
    console.warn("MEGALLM_API_KEY is not set. AI features will use mock data or fail.");
}

if (!hasUsableGroqApiKey) {
    console.warn("GROQ_API_KEY is not set. Refine/start-task/copilot features will use local fallback behavior.");
}

const client = new OpenAI({
    baseURL: "https://ai.megallm.io/v1",
    apiKey: apiKey || "dummy_key", // Prevent crash on build if key missing, but calls will fail
    timeout: 120000, // 120s timeout to handle complex strategy generation
});

const groqClient = hasUsableGroqApiKey
    ? new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: groqApiKey as string,
        timeout: 90000,
    })
    : null;

const STRATEGY_MODEL = process.env.MEGALLM_MODEL || "deepseek-ai/deepseek-v3.1-terminus";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_RETRY_ATTEMPTS = 3;
const ENABLE_LOCAL_STRATEGY_FALLBACK = process.env.ENABLE_LOCAL_STRATEGY_FALLBACK !== "false";
let groqAuthFailed = false;

function requireGroqClient() {
    if (groqAuthFailed || !groqClient) {
        throw new Error("GROQ_API_KEY is not set");
    }
    return groqClient;
}

function markGroqAuthFailure(error: any) {
    const status = getErrorStatus(error);
    const code = String(error?.code || "").toLowerCase();
    const message = String(error?.message || "").toLowerCase();
    if (status === 401 || code.includes("invalid_api_key") || message.includes("invalid api key")) {
        groqAuthFailed = true;
    }
}

function buildRefinedTaskFallback(task: StrategyTask): StrategyTask {
    return {
        ...task,
        description: `${task.description} Next: define a clear owner, measurable outcome, and completion date for this task.`,
        rationale: `${task.rationale} This refinement was generated locally because Groq is unavailable.`,
        estimatedTime: task.estimatedTime || "1 day"
    };
}

function buildTaskChecklistFallback(task: StrategyTask): string[] {
    return [
        `Clarify success criteria for \"${task.title}\"`,
        "Break the work into 2-3 concrete deliverables",
        "Assign owner, deadline, and dependency checks",
        "Execute first deliverable and record progress",
        "Review blockers and update the next action"
    ];
}

function buildCopilotFallback(strategy: StrategyPlan, userMessage: string): string {
    const pending = strategy.tasks.filter(t => t.status !== "completed");
    const nextTask = pending[0];

    return [
        "Groq is temporarily unavailable, so I am using a local guidance fallback.",
        `You asked: \"${userMessage || "help with this strategy"}\"`,
        nextTask
            ? `Best next step: start \"${nextTask.title}\" and complete one concrete deliverable today.`
            : "All tasks look completed. Focus on retrospective notes and the next strategic milestone.",
        "If you add a valid GROQ_API_KEY in .env.local and restart, full AI copilot responses will resume."
    ].join("\n\n");
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorStatus(error: any): number | undefined {
    return error?.status ?? error?.response?.status;
}

function isRetryableError(error: any): boolean {
    const status = getErrorStatus(error);
    if (!status) {
        const msg = String(error?.message || "").toLowerCase();
        return msg.includes("timeout") || msg.includes("timed out") || msg.includes("network");
    }
    return [429, 500, 502, 503, 504].includes(status);
}

function sanitizeErrorMessage(error: any): string {
    const raw = String(error?.message || "Unknown error").trim();
    if (raw.toLowerCase().includes("<html")) {
        const status = getErrorStatus(error);
        if (status === 503) {
            return "AI provider is temporarily unavailable (503). Please try again in 30-60 seconds.";
        }
        return `AI provider returned an HTML error page${status ? ` (status ${status})` : ""}.`;
    }
    return raw;
}

function buildLocalFallbackStrategy(
    problem: string,
    constraints?: { deadline?: string; urgency?: string; resources?: string }
): StrategyPlan {
    const deadline = constraints?.deadline?.trim();
    const urgency = (constraints?.urgency || "medium").toLowerCase();
    const resources = constraints?.resources?.trim();

    const estimatedDuration = deadline || (urgency === "high" ? "2 weeks" : urgency === "low" ? "6 weeks" : "4 weeks");

    const tasks: StrategyTask[] = [
        {
            id: Math.random().toString(36).slice(2),
            title: "Define Success Criteria",
            description: `Break the problem into measurable outcomes for: ${problem}`,
            rationale: "Clear success criteria prevent scope drift and make execution objective.",
            priority: "high",
            status: "pending",
            estimatedTime: "0.5 day",
            dependencies: []
        },
        {
            id: Math.random().toString(36).slice(2),
            title: "Design Execution Plan",
            description: "Create milestones, owners, and a realistic sequence based on constraints.",
            rationale: "A time-boxed plan with ownership is required before execution starts.",
            priority: "high",
            status: "pending",
            estimatedTime: urgency === "high" ? "1 day" : "2 days",
            dependencies: ["Define Success Criteria"]
        },
        {
            id: Math.random().toString(36).slice(2),
            title: "Execute Highest-Impact Milestone",
            description: "Start with the milestone that gives the largest progress signal quickly.",
            rationale: "Early momentum reduces risk and validates assumptions.",
            priority: "high",
            status: "pending",
            estimatedTime: urgency === "high" ? "3 days" : "5 days",
            dependencies: ["Design Execution Plan"]
        },
        {
            id: Math.random().toString(36).slice(2),
            title: "Review Risks and Adjust",
            description: "Assess blockers, update priorities, and rebalance scope against constraints.",
            rationale: "Continuous replanning keeps the strategy feasible under uncertainty.",
            priority: "medium",
            status: "pending",
            estimatedTime: "1 day",
            dependencies: ["Execute Highest-Impact Milestone"]
        },
        {
            id: Math.random().toString(36).slice(2),
            title: "Finalize and Document Outcomes",
            description: "Close open items, document results, and define next actions.",
            rationale: "A formal closeout preserves learnings and enables scale.",
            priority: "medium",
            status: "pending",
            estimatedTime: "1 day",
            dependencies: ["Review Risks and Adjust"]
        }
    ];

    const constraintsText = [
        deadline ? `deadline: ${deadline}` : null,
        resources ? `resources: ${resources}` : null,
        `urgency: ${urgency}`
    ].filter(Boolean).join(", ");

    return {
        title: "Contingency Strategy Plan",
        summary: `This plan was generated using local fallback logic because the AI provider was temporarily unavailable. Problem focus: ${problem}. Constraints considered: ${constraintsText}.`,
        estimatedDuration,
        tasks
    };
}

export interface StrategyTask {
    id: string; // Unique identifier for the task
    title: string;
    description: string;
    rationale: string;
    priority: "high" | "medium" | "low";
    status?: "pending" | "in-progress" | "completed";
    subSteps?: { title: string, isCompleted: boolean }[];
    estimatedTime: string;
    dependencies?: string[];
    aiReasoning?: string; // New field for cached AI explanation
    riskLevel?: "high" | "medium" | "low";
    riskReason?: string;
    decisionContext?: {
        reason: string; // Why this task was chosen
        alternatives: string[]; // What else was considered
        tradeoffs: string; // Why the alternative was rejected
    };
}

export interface StrategyPlan {
    title: string;
    summary: string;
    estimatedDuration: string; // New field for dynamic duration
    tasks: StrategyTask[];
    analysis?: {
        bottlenecks: string[];
        lastRun: string;
    };
    versions?: {
        timestamp: string;
        changes: string;
        plan: StrategyPlan;
    }[];
}

export async function generateStrategy(
    problem: string,
    constraints?: { deadline?: string; urgency?: string; resources?: string }
): Promise<StrategyPlan> {
    try {
        if (!apiKey && ENABLE_LOCAL_STRATEGY_FALLBACK) {
            console.warn("MEGALLM_API_KEY missing. Returning local fallback strategy.");
            return buildLocalFallbackStrategy(problem, constraints);
        }

        const systemPrompt = `
You are an expert strategic planner AI. Your goal is to break down complex problems into actionable, step-by-step implementation plans.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. **CONSTRAINT ADHERENCE IS MANDATORY**: You must design the strategy to fit STRICTLY within the provided "Deadline" and "Resources". 
   - If the Deadline is "2 weeks", the final task MUST be completed by week 2. Do NOT create a 5-week plan.
   - If Resources are "$500", do NOT suggest expensive tools. Suggest free/open-source alternatives.
   - If Urgency is "High", parallelize tasks aggressively.

2. **RESOURCE UTILIZATION**:
   - Use the provided "Resources" to tailor the recommended tools, budget, and team size in the task descriptions.
   - Explicitly mention how the resources are being used in the "rationale" or "description" of relevant tasks.

3. **JSON STRUCTURE**:
   You MUST return valid JSON matching this structure:
   {
     "title": "A personalized, catchy title",
     "summary": "A brief overview",
     "estimatedDuration": "Total duration (e.g., '4 weeks' or '2 months') based on the critical path",
     "tasks": [
       {
         "title": "Task Title",
         "description": "Detailed explanation",
         "rationale": "Why this step is important",
         "priority": "high" | "medium" | "low",
         "estimatedTime": "e.g. 2 days",
         "dependencies": ["Task Title of dependency"]
       }
     ]
   }
`;

        const constraintsObj = constraints || {};
        const formattedConstraints = `
---------------------------------------------------
*** STRICT CONSTRAINTS ***
- DEADLINE: ${constraintsObj.deadline ? constraintsObj.deadline.toUpperCase() : "As fast as possible"}
- RESOURCES: ${constraintsObj.resources ? constraintsObj.resources.toUpperCase() : "Standard"}
- URGENCY: ${constraintsObj.urgency ? constraintsObj.urgency.toUpperCase() : "Medium"}
---------------------------------------------------
`;

        const userPrompt = `
PROBLEM STATEMENT: 
"${problem}"

${formattedConstraints}

INSTRUCTION: 
Generate a strategy that SOLVES the problem WITHIN the constraints above. 
Refuse to generate a generic plan; tailor it specifically to the time and resources available.
Calculate the "estimatedDuration" carefully based on the task dependencies and timeline.
`;

        console.log("DEBUG: generateStrategy called with constraints:", JSON.stringify(constraints));
        console.log("DEBUG: API Key available:", !!apiKey);
        console.log("DEBUG: Base URL:", client.baseURL);

        let lastError: any;
        let content: string | null | undefined;

        for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                const completion = await client.chat.completions.create({
                    model: STRATEGY_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                });

                content = completion.choices[0].message.content;
                break;
            } catch (error: any) {
                lastError = error;
                const retryable = isRetryableError(error);
                const hasMoreAttempts = attempt < MAX_RETRY_ATTEMPTS;

                console.error(`Strategy generation attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, {
                    status: getErrorStatus(error),
                    message: sanitizeErrorMessage(error)
                });

                if (!retryable || !hasMoreAttempts) {
                    throw error;
                }

                // Exponential backoff with small jitter for temporary provider errors.
                const backoffMs = (2000 * Math.pow(2, attempt - 1)) + Math.floor(Math.random() * 500);
                await sleep(backoffMs);
            }
        }

        if (!content && lastError) {
            throw lastError;
        }

        console.log("DEBUG: AI Response Content Length:", content?.length);

        if (!content) {
            throw new Error("No content received from AI");
        }

        const plan = JSON.parse(content) as StrategyPlan;

        // Ensure default status and IDs
        plan.tasks = plan.tasks.map(t => ({
            ...t,
            id: t.id || Math.random().toString(36).substring(7),
            status: 'pending'
        }));

        return plan;

    } catch (error: any) {
        console.error("Error generating strategy with MegaLLM:", error);

        // Detailed error logging
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", JSON.stringify(error.response.data));
        } else if (error.request) {
            console.error("No response received from API:", error.request);
        } else {
            console.error("Error setting up request:", error.message);
        }

        // Log diagnositc info
        if (error?.status === 401) {
            console.error("Diagnostics: 401 Unauthorized. Check if MEGALLM_API_KEY is correct in .env.local.");
        } else if (error?.status === 404) {
            console.error("Diagnostics: 404 Not Found. Check the baseURL or model name.");
        }

        const status = getErrorStatus(error);
        const safeMessage = sanitizeErrorMessage(error);

        if (status === 503 && ENABLE_LOCAL_STRATEGY_FALLBACK) {
            console.warn("AI service returned 503 repeatedly. Returning local fallback strategy.");
            return buildLocalFallbackStrategy(problem, constraints);
        }

        if (status === 503) {
            throw new Error("AI service is temporarily unavailable (503). Please try again in 30-60 seconds.");
        }

        throw new Error(safeMessage);
    }
}

export async function refineTask(
    task: StrategyTask,
    context: string
): Promise<StrategyTask> {
    const systemPrompt = `
You are an expert project manager. Refine the following task to be more specific, actionable, and clear.
Keep the same structure but improve the content.
JSON Output only.
`;
    // ... Simplified implementation for brevity, assuming standard completion
    // logic similar to generateStrategy but for a single task
    const userPrompt = `
Context: ${context}
Task to Refine: ${JSON.stringify(task)}
`;

    try {
        const completion = await requireGroqClient().chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");

        return JSON.parse(content) as StrategyTask;
    } catch (error) {
        console.error("Error refining task with Groq:", error);
        markGroqAuthFailure(error);
        return buildRefinedTaskFallback(task);
    }
}

export async function explainTask(
    task: StrategyTask,
    context: string
): Promise<string> {
    const systemPrompt = `
You are an expert mentor and strategist.
Explain the reasoning behind a specific task within a larger strategy.
Target Audience: The user executing the task.
Goal: Motivate them by explaining WHY this task is critical, how it connects to the bigger picture, and why it was prioritized this way.
Format: Return a JSON object with a single key "reasoning" containing a clear, human-readable paragraph (no markdown, just text).
Example: { "reasoning": "This step is crucial because..." }
`;

    const userPrompt = `
Strategy Context: ${context}
Task: ${task.title}
Description: ${task.description}
Rationale: ${task.rationale}
Priority: ${task.priority}

Explain the reasoning.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) return "No explanation generated.";

        const parsed = JSON.parse(content);
        return parsed.reasoning || "No explanation generated.";
    } catch (e) {
        console.error("Error explaining task:", e);
        return "Failed to generate explanation.";
    }
}

export async function decomposeTask(task: StrategyTask): Promise<string[]> {
    const systemPrompt = `
You are an expert project manager. Break down the following task into 3-5 actionable checklist items.
RETURN ONLY RAW JSON. DO NOT USE MARKDOWN. DO NOT USE \`\`\`json.
Example output: ["Step 1", "Step 2", "Step 3"]
`;
    const userPrompt = `
Task: ${task.title}
Description: ${task.description}
Rationale: ${task.rationale}

Generate checklist items.
`;

    try {
        console.log("DEBUG_AI: Decomposing task:", task.title);
        const completion = await requireGroqClient().chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const content = completion.choices[0].message.content;
        console.log("DEBUG_AI: Raw Decompose Content:", content);

        if (!content) return buildTaskChecklistFallback(task);

        // Clean up markdown code blocks if present (just in case)
        const cleanContent = content.replace(/```json\n?|```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanContent);
        } catch (err) {
            console.error("JSON Parse Error in decomposeTask:", err, "Content:", content);
            // Fallback: try to match array pattern regex
            const match = content.match(/\[[\s\S]*\]/);
            if (match) {
                try {
                    parsed = JSON.parse(match[0]);
                } catch {
                    return buildTaskChecklistFallback(task);
                }
            } else {
                return buildTaskChecklistFallback(task);
            }
        }
        // Handle if it returns { items: [...] } or just [...]
        if (Array.isArray(parsed)) return parsed;
        if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
        if (parsed.steps && Array.isArray(parsed.steps)) return parsed.steps;
        if (parsed.checklist && Array.isArray(parsed.checklist)) return parsed.checklist; // Added checklist key handling

        return buildTaskChecklistFallback(task);
    } catch (e) {
        console.error("Error decomposing task:", e);
        markGroqAuthFailure(e);
        return buildTaskChecklistFallback(task);
    }
}

export interface RiskItem {
    taskIndex: number;
    riskLevel: "high" | "medium" | "low";
    reason: string;
}

export interface RiskAnalysis {
    risks: RiskItem[];
    bottlenecks: string[]; // General strategy bottlenecks
}

export async function analyzeRisks(plan: StrategyPlan): Promise<RiskAnalysis> {
    const systemPrompt = `
You are an expert project risk analyst.
Analyze the following strategy plan for potential risks, bottlenecks, and time overruns.
Identify specific tasks that are high-risk due to complexity, dependencies, or aggressive timelines.
Return JSON only:
{
  "risks": [
    { "taskIndex": 0, "riskLevel": "high", "reason": "..." }
  ],
  "bottlenecks": ["Description of a general bottleneck..."]
}
`;

    // Simplify plan for prompt to save tokens
    const simplePlan = {
        title: plan.title,
        tasks: plan.tasks.map((t, i) => ({
            index: i,
            title: t.title,
            duration: t.estimatedTime,
            priority: t.priority,
            dependencies: t.dependencies
        }))
    };

    const userPrompt = `
Plan: ${JSON.stringify(simplePlan)}

Analyze risks.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const content = completion.choices[0].message.content;
        if (!content) return { risks: [], bottlenecks: [] };

        return JSON.parse(content) as RiskAnalysis;
    } catch (e) {
        console.error("Error analyzing risks:", e);
        return { risks: [], bottlenecks: [] };
    }
}

export async function replanStrategy(
    currentPlan: StrategyPlan,
    event: { type: "delay" | "skip" | "constraint", detail: string }
): Promise<StrategyPlan> {
    const systemPrompt = `
You are an expert strategic planner adapting to a changing situation.
The user has encountered an issue (delay, skipped task, or new constraint).
Your goal: Re-optimize the remaining tasks to still achieve the goal efficiently.
- Adjust priorities if needed.
- Re-order tasks if logical.
- Update timelines.
- KEEP completed tasks as is.
- RETURN the full updated plan JSON.
`;

    const userPrompt = `
Current Plan:
${JSON.stringify({
        title: currentPlan.title,
        tasks: currentPlan.tasks.map((t, i) => ({
            index: i,
            title: t.title,
            status: t.status,
            duration: t.estimatedTime,
            priority: t.priority,
            dependencies: t.dependencies
        }))
    })}

Event: ${event.type.toUpperCase()} - ${event.detail}

Generate updated plan.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.6,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");

        const parsed = JSON.parse(content) as StrategyPlan;

        // Ensure every task has an ID
        parsed.tasks = parsed.tasks.map(task => ({
            ...task,
            id: task.id || Math.random().toString(36).substring(7)
        }));

        return parsed;
    } catch (e) {
        console.error("Error replanning:", e);
        throw e;
    }
}

export async function suggestNextBestAction(plan: StrategyPlan): Promise<{ taskId: string; reason: string }> {
    const pendingTasks = plan.tasks.filter(t => t.status !== 'completed');
    if (pendingTasks.length === 0) return { taskId: "", reason: "All tasks completed!" };

    const systemPrompt = `
You are an expert productivity coach.
Analyze the pending tasks and recommend the ONE single task the user should do NEXT.
Consider:
- Dependencies (must be clear)
- Priority (High > Medium > Low)
- Logical sequencing
- "Quick wins" vs "Deep work" (balance)

Return JSON: { "taskId": "...", "reason": "Short punchy reason why" }
`;

    const userPrompt = `
Pending Tasks:
${JSON.stringify(pendingTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dependencies: t.dependencies
    })))}

Recommend next action.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        if (!content) return { taskId: pendingTasks[0].id, reason: "Fallback recommendation." };

        return JSON.parse(content);
    } catch (e) {
        console.error("Error suggesting action:", e);
        return { taskId: pendingTasks[0].id, reason: "Fallback: Start with the top task." };
    }
}

export async function evaluateConfidence(plan: StrategyPlan): Promise<{ score: number; factors: { label: string; impact: string }[] }> {
    const systemPrompt = `
You are a strategic risk assessor.
Evaluate the given strategy plan for clarity, feasibility, and robustness.
Output a confidence score (0-100) and list key factors influencing the score.
High confidence means:
- Clear dependencies
- Realistic timelines
- Low ambiguity

Return JSON: { "score": 85, "factors": [ { "label": "Clear goals", "impact": "positive" }, { "label": "Tight timeline", "impact": "negative" } ] }
`;

    const userPrompt = `
Plan Title: ${plan.title}
Task Count: ${plan.tasks.length}
Summary: ${plan.summary}

Evaluate confidence.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        });

        const content = completion.choices[0].message.content;
        if (!content) return { score: 80, factors: [{ label: "Automated Plan", impact: "neutral" }] };

        return JSON.parse(content);
    } catch (e) {
        console.error("Error evaluating confidence:", e);
        return { score: 75, factors: [{ label: "Evaluation Failed", impact: "neutral" }] };
    }
}

export interface AnalyticsInsights {
    workingWell: string;
    struggles: string;
    improvements: string;
}

export async function generateAnalyticsInsights(metrics: any): Promise<AnalyticsInsights> {
    const systemPrompt = `
You are a business intelligence analyst.
Analyze the provided productivity metrics and generate 3 concise insights:
1. What is working well?
2. Where is the user struggling?
3. What is one actionable improvement?

Return JSON: { "workingWell": "...", "struggles": "...", "improvements": "..." }
Keep sentences short and encouraging.
`;

    const userPrompt = `
Metrics:
- Completion Rate: ${metrics.completionRate}%
- Avg Task Duration: ${metrics.avgTaskDuration} days
- Tasks Overdue: ${metrics.tasksOverdue}

Generate insights.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
        });

        const content = completion.choices[0].message.content;
        if (!content) return { workingWell: "Good progress on tasks.", struggles: "No major issues detected.", improvements: "Keep maintaining momentum." };

        return JSON.parse(content);
    } catch (e) {
        console.error("Error generating insights:", e);
        return { workingWell: "Data tracking active.", struggles: "Insufficient data for deep analysis.", improvements: "Continue using the platform." };
    }
}

export interface Scenario {
    name: "Best Case" | "Most Likely" | "Worst Case";
    completionTime: string;
    successLikelihood: number; // 0-100
    risks: string[];
    decisionPoints: string[];
    explanation: string;
}

export async function simulateScenarios(plan: StrategyPlan): Promise<Scenario[]> {
    const prompt = `
Analyze the following strategy plan and generate 3 simulation scenarios:
1. Best Case: Everything goes perfectly.
2. Most Likely: Realistic execution with minor hiccups.
3. Worst Case: Major delays and risks materialize.

Plan Summary: ${plan.summary}
Tasks: ${plan.tasks.map(t => t.title).join(", ")}

Return JSON array of objects with keys: name, completionTime, successLikelihood (0-100), risks (array of strings), decisionPoints (array of strings), explanation (plain language).
`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.6,
        }, { signal: controller.signal });

        clearTimeout(timeoutId);

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");
        const result = JSON.parse(content);
        return result.scenarios || result; // Handle if wrapped in key
    } catch (e) {
        console.error("Simulation failed, falling back to local engine:", e);

        // Local deterministic simulation based on plan characteristics
        const taskCount = plan.tasks.length;
        const baseTime = taskCount * 2; // rough estimate days

        return [
            {
                name: "Most Likely",
                completionTime: `${baseTime} days`,
                successLikelihood: 75,
                risks: ["Resource constraints during execution", "Potential scope creep in later phases"],
                decisionPoints: ["Go/No-Go decision after MVP", "Budget review at 50% completion"],
                explanation: "The plan follows a logical structure. Assuming standard team velocity, execution should proceed with minor delays."
            },
            {
                name: "Best Case",
                completionTime: `${Math.round(baseTime * 0.8)} days`,
                successLikelihood: 90,
                risks: ["None significant"],
                decisionPoints: ["Early launch possibility"],
                explanation: "If all dependencies are met early and no unexpected bugs occur, the timeline could be compressed significantly."
            },
            {
                name: "Worst Case",
                completionTime: `${Math.round(baseTime * 1.5)} days`,
                successLikelihood: 40,
                risks: ["Critical path delays", "External dependency failures", "Market changes"],
                decisionPoints: ["Scope reduction", "Emergency resource allocation"],
                explanation: "Major bottlenecks in the development phase could compound, leading to significant delays and potential project restructuring."
            }
        ];
    }
}

export interface AgentOpinion {
    agentName: "Optimizer" | "Risk Analyst" | "Quality Assurance" | "Execution Realist";
    critique: string;
    suggestion: string;
}

export interface DebateResult {
    opinions: AgentOpinion[];
    synthesis: string;
}

export async function runMultiAgentDebate(plan: StrategyPlan): Promise<DebateResult> {
    const prompt = `
Simulate a debate between 4 AI agents reviewing this strategy:
1. Optimizer (speed/efficiency focus)
2. Risk Analyst (safety/contingency focus)
3. Quality Assurance (standards/completeness focus)
4. Execution Realist (practicality/resource focus)

Plan: ${plan.title} - ${plan.summary}

Output JSON with:
- opinions: Array of { agentName, critique, suggestion }
- synthesis: Final consensus plan after debate.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");
        return JSON.parse(content);
    } catch (e) {
        console.error("Debate failed, falling back to local engine:", e);
        return {
            opinions: [
                {
                    agentName: "Optimizer",
                    critique: "The timeline seems conservative. We could parallelize the research and design phases to save 15% of the schedule.",
                    suggestion: "Combine early data gathering with initial prototyping."
                },
                {
                    agentName: "Risk Analyst",
                    critique: "I see potential bottlenecks in the dependency chain. If the core feature definition is delayed, the whole project slips.",
                    suggestion: "Add a 20% buffer to the critical path tasks."
                },
                {
                    agentName: "Quality Assurance",
                    critique: "The plan implies a rush to market. We must ensure adequate testing time is allocated before the beta release.",
                    suggestion: "Explicitly add 'Integration Testing' as a blocking task."
                },
                {
                    agentName: "Execution Realist",
                    critique: "Good plan on paper, but resource availability isn't clearly defined. Do we actually have the team to execute parallel tracks?",
                    suggestion: "Verify team bandwidth before committing to this sprint structure."
                }
            ],
            synthesis: "The consensus is to proceed but with caution regarding the critical path. Parallelizing tasks where possible could improve speed, but not at the cost of quality assurance. A buffer should be added to the timeline to account for unforeseen delays."
        };
    }
}
// ... existing code

export async function traceDecisions(task: StrategyTask, context: string): Promise<NonNullable<StrategyTask['decisionContext']>> {
    const systemPrompt = `
You are a strategic historian and decision analyst.
Analyze the given task within the strategy context.
Reconstruct the decision-making process that led to this task.
1. Identify the core reason why this specific approach was chosen.
2. Identify 2-3 plausible alternative approaches that were likely considered but rejected.
3. Explain the trade-off (why the chosen path is better).

Return JSON:
{
  "reason": "The specific reason...",
  "alternatives": ["Alternative 1", "Alternative 2"],
  "tradeoffs": "Explanation of why alternatives were rejected..."
}
`;

    const userPrompt = `
Strategy Context: ${context}
Task: ${task.title}
Description: ${task.description}
Rationale: ${task.rationale}

Trace the decision.
`;

    try {
        const completion = await client.chat.completions.create({
            model: "deepseek-ai/deepseek-v3.1-terminus",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.6,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content");
        return JSON.parse(content);
    } catch (e) {
        console.error("Decision trace failed, falling back to local:", e);
        return {
            reason: task.rationale || "Selected for optimal execution flow.",
            alternatives: ["Manual execution", "Outsourcing this step"],
            tradeoffs: "The chosen approach balances speed and control better than alternatives."
        };
    }
}

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export async function chatWithStrategy(
    strategy: StrategyPlan,
    messages: ChatMessage[]
): Promise<string> {
    try {
        const systemPrompt = `
You are a Senior Strategic Advisor AI. You are reviewing a specific strategy plan.
Your goal is to help the user understand, execute, and improve this strategy.

CONTEXT:
Title: "${strategy.title}"
Summary: "${strategy.summary}"
Active Tasks: ${strategy.tasks.length}

TASKS DETAIL:
${JSON.stringify(strategy.tasks.map(t => ({
            title: t.title,
            status: t.status || 'pending',
            priority: t.priority,
            description: t.description,
            dependencies: t.dependencies
        })), null, 2)}

GUIDELINES:
1. Answer strictly based on the provided strategy context.
2. If the user asks for changes, suggest them but remind them you cannot directly edit the database yet.
3. Be practical, insightful, and encouraging.
4. Keep responses concise and structured (use markdown).
5. If the user asks something unrelated (e.g. "Who is the president?"), politely steer them back to the strategy.
`;

        const completion = await requireGroqClient().chat.completions.create({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            temperature: 0.7,
        });

        return completion.choices[0].message.content || "I couldn't generate a response.";
    } catch (error) {
        console.error("Error in chatWithStrategy:", error);
        markGroqAuthFailure(error);
        const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content || "";
        return buildCopilotFallback(strategy, lastUserMessage);
    }
}
