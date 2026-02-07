import { OpenAIEmbeddings } from "@langchain/openai";

let _embeddings: OpenAIEmbeddings | null = null;

export function getEmbeddings(): OpenAIEmbeddings {
  if (!_embeddings) {
    _embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _embeddings;
}

