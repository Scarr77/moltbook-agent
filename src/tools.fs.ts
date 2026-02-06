import fs from "fs/promises";
import path from "path";
import { ReadFileSchema, WriteFileSchema } from "./contracts.ts";

const SANDBOX = path.resolve(process.cwd(), "sandbox");

function safe(p: string) {
  const resolved = path.resolve(SANDBOX, p);
  if (!resolved.startsWith(SANDBOX)) throw new Error("Path outside sandbox");
  return resolved;
}

export async function readFileTool(input: unknown) {
  const { path: p } = ReadFileSchema.parse(input);
  return fs.readFile(safe(p), "utf8");
}

export async function writeFileTool(input: unknown) {
  const { path: p, content } = WriteFileSchema.parse(input);
  const target = safe(p);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, "utf8");
  return "ok";
}

