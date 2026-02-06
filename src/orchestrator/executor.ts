import type { PlanStep } from "./planner.ts";
import { retrieveContext } from "../tools/retrieval.ts";
import { llm } from "../tools/llm.ts";
import { route } from "./router.ts";
import { runTool } from "../tools/registry.ts";

import { AnalystAgent } from "../agents/analyst.ts";
import { SalesAgent } from "../agents/sales.ts";

import { startSpan, endSpan } from "../telemetry/tracer.ts";
import type { Trace } from "../telemetry/tracer.ts";

const AGENTS = {
  analyst: AnalystAgent,
  sales: SalesAgent,
};

export async function execute(
  plan: PlanStep[],
  input: string,
  trace: Trace
): Promise<string> {
  let context = "";
  let output = "";

  for (const step of plan) {
    switch (step.action) {
      case "retrieve_context": {
        const span = startSpan(trace, "retrieve_context", {
          query: step.query,
        });

        context = await retrieveContext(step.query);

        endSpan(span, {
          chars: context.length,
        });
        break;
      }

      case "tool_call": {
        const span = startSpan(trace, "tool_call", {
          tool: step.tool,
          args: step.args,
        });

        const result = await runTool(step.tool, step.args);

        context += `\n\n[Tool result: ${step.tool}]\n${result}`;

        endSpan(span, {
          chars: String(result).length,
        });
        break;
      }

      case "generate_answer": {
        const agentName = await route(step, input, trace);
        const agent = AGENTS[agentName];

        const span = startSpan(trace, "generate_answer", {
          agent: agentName,
        });

        const res = await llm.invoke(
          `${agent.systemPrompt}

Use the following context:
${context}

Question:
${input}`
        );

        output =
          typeof res.content === "string"
            ? res.content
            : Array.isArray(res.content)
            ? res.content.map(c => (c as any)?.text ?? "").join("")
            : "";

        endSpan(span, {
          chars: output.length,
        });

        return output;
      }
    }
  }

  return output;
}

