import { z } from "zod";
import { llm } from "../tools/llm.ts";
import { startSpan, endSpan } from "../telemetry/tracer.ts";
import type { Trace } from "../telemetry/tracer.ts";

/**
 * -----------------------------
 * Schema Definitions
 * -----------------------------
 */

export const PlanStepSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("retrieve_context"),
    query: z.string(),
  }),

  z.object({
    action: z.literal("tool_call"),
    tool: z.enum([
      "read_file",
      "write_file",
      "http_get",
      "browser_open",
      "browser_extract",
      "browser_close",
    ]),
    args: z.record(z.any()),
  }),

  z.object({
    action: z.literal("generate_answer"),
  }),
]);

export type PlanStep = z.infer<typeof PlanStepSchema>;
export const PlanSchema = z.array(PlanStepSchema);

/**
 * -----------------------------
 * Planner
 * -----------------------------
 */

export async function plan(
  input: string,
  trace: Trace
): Promise<PlanStep[]> {
  const span = startSpan(trace, "planner", { input });

  const prompt = `
You are a planning module for an AI agent.

Your job is to produce a JSON array of steps.

Allowed actions:
1. retrieve_context { query: string }
2. tool_call {
     tool:
       "read_file" |
       "write_file" |
       "http_get" |
       "browser_open" |
       "browser_extract" |
       "browser_close",
     args: object
   }
3. generate_answer

Rules:
- ALWAYS include retrieve_context first
- Use tool_call if real-world interaction is required
- ALWAYS end with generate_answer
- Output ONLY valid JSON
- Do NOT include explanations or markdown

User input:
"${input}"

Example outputs:

File task:
[
  { "action": "retrieve_context", "query": "${input}" },
  {
    "action": "tool_call",
    "tool": "read_file",
    "args": { "path": "notes.txt" }
  },
  { "action": "generate_answer" }
]

Web task:
[
  { "action": "retrieve_context", "query": "${input}" },
  {
    "action": "tool_call",
    "tool": "browser_open",
    "args": { "url": "https://example.com" }
  },
  {
    "action": "tool_call",
    "tool": "browser_extract",
    "args": { "selector": "body" }
  },
  {
    "action": "tool_call",
    "tool": "browser_close",
    "args": {}
  },
  { "action": "generate_answer" }
]
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
    endSpan(span, { error: "invalid_json", raw: content });
    throw new Error(`Planner produced invalid JSON:\n${content}`);
  }

  const steps = PlanSchema.parse(parsed);

  endSpan(span, {
    steps: steps.map(s => s.action),
  });

  return steps;
}

