import { ChatOpenAI } from "@langchain/openai";

let _llm: ChatOpenAI | null = null;

export function getLLM() {
  if (!_llm) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set at runtime");
    }

    _llm = new ChatOpenAI({
      temperature: 0.2,
    });
  }

  return _llm;
}

