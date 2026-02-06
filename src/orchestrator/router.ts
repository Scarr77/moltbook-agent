import { z } from "zod";
import { llm } from "../tools/llm.ts";
import { startSpan, endSpan } from "../telemetry/tracer.ts";
import type { Trace } from "../telemetry/tracer.ts";
import type { PlanStep } from "./planner.ts";

export type AgentName = "analyst" | "sales";

const RouteSchema = z.object({
  agent: z.enum(["analyst", "sales"]),
});

/**
 * LLM-driven router with schema validation + telemetry
 */
export async function route(
  step: PlanStep,
  input: string,
  trace: Trace
): Promise<AgentName> {
  // Only route when generating an answer
  if (step.action !== "generate_answer") {
    return "analyst";
  }

  const span = startSpan(trace, "router", { input });

  const prompt = `
You are a routing module for a multi-agent AI system.

Choose which agent should answer the user's question.

Agents:
- analyst: factual, technical, explanatory
- sales: persuasive, value-oriented, business-focused

Rules:
- Output ONLY valid JSON
- No markdown
- No explanations

User question:
"${input}"

JSON format:
{ "agent": "analyst" | "sales" }
`;

  const res = await llm.invoke(prompt);

  const content =
    typeof res.content === "string"
      ? res.content
      : Array.isArray(res.content)
      ? res.content.map(c => (c as any)?.text ?? "").join("")
      : "";

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    endSpan(span, { error: "invalid_json", rawOutput: content });
    return "analyst";
  }

  const result = RouteSchema.safeParse(parsed);

  if (!result.success) {
    endSpan(span, { error: "schema_violation", rawOutput: content });
    return "analyst";
  }

  endSpan(span, { agent: result.data.agent });
  return result.data.agent;
}

