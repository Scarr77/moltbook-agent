import { chromium } from "playwright";

let browser: any;
let page: any;

export async function browserOpen(url: string): Promise<string> {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  await page.goto(url);
  return `Opened ${url}`;
}

export async function browserExtract(selector: string): Promise<string> {
  if (!page) throw new Error("Browser not open");
  const text = await page.textContent(selector);
  return text ?? "";
}

export async function browserClose(): Promise<string> {
  if (browser) await browser.close();
  browser = null;
  page = null;
  return "Browser closed";
}

