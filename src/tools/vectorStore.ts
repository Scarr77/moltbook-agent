import { Chroma } from "@langchain/community/vectorstores/chroma";
import { getEmbeddings } from "./embeddings.ts";

let _store: Chroma | null = null;

export async function getVectorStore(): Promise<Chroma> {
  if (_store) {
    return _store;
  }

  _store = await Chroma.fromExistingCollection(
    getEmbeddings(),
    {
      collectionName: "moltbook-memory",
      url: "http://localhost:8000",
    }
  );

  return _store;
}
