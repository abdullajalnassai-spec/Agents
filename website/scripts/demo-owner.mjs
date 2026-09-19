import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const out = "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/owner`, { waitUntil: "domcontentloaded" });
await page.fill("#email", "abdulla.j.alnassai@gmail.com");
await page.fill("#password", "EmonphenomHQ2026!");
await page.click('button[type="submit"]');
await page.waitForURL((url) => url.pathname.includes("/studio"), { timeout: 20000 });
await page.screenshot({ path: `${out}/emonphenom_hq.png`, fullPage: true });

await page.goto(`${base}/studio/forge`, { waitUntil: "domcontentloaded" });
await page.fill("#topic", "AI client acquisition");
await page.fill("#audience", "Faceless freelancers");
await page.selectOption("#productType", "Prompt pack");
await page.click('button[type="submit"]');
await page.waitForSelector("text=1. Research", { timeout: 20000 });
await page.screenshot({ path: `${out}/emonphenom_forge.png`, fullPage: true });

console.log("EMONPHENOM DEMO OK");
await browser.close();
