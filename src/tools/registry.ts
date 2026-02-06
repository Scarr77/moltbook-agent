import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";
import { chromium } from "playwright";

type ToolName =
  | "read_file"
  | "write_file"
  | "http_get"
  | "browser_open"
  | "browser_extract"
  | "browser_close";

let browser: any = null;
let page: any = null;

export async function runTool(
  tool: ToolName,
  args: any
): Promise<string> {
  switch (tool) {
    case "read_file": {
      if (!args?.path) {
        throw new Error("read_file requires { path }");
      }
      return await readFile(args.path, "utf-8");
    }

    case "write_file": {
      if (!args?.path || args?.content === undefined) {
        throw new Error("write_file requires { path, content }");
      }
      await writeFile(args.path, String(args.content), "utf-8");
      return `Wrote file ${args.path}`;
    }

    case "http_get": {
      if (!args?.url) {
        throw new Error("http_get requires { url }");
      }
      const res = await fetch(args.url);
      return await res.text();
    }

    case "browser_open": {
      if (!args?.url) {
        throw new Error("browser_open requires { url }");
      }
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();
      await page.goto(args.url);
      return `Opened ${args.url}`;
    }

    case "browser_extract": {
      if (!page) {
        throw new Error("browser_extract called before browser_open");
      }
      if (!args?.selector) {
        throw new Error("browser_extract requires { selector }");
      }
      const text = await page.textContent(args.selector);
      return text ?? "";
    }

    case "browser_close": {
      if (browser) {
        await browser.close();
      }
      browser = null;
      page = null;
      return "Browser closed";
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

