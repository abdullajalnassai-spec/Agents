import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:8787";
const out = "/opt/cursor/artifacts/screenshots";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/owner`);
await page.fill("#email", "abdulla.j.alnassai@gmail.com");
await page.fill("#password", "MeridianOwner2026!");
await page.click('button[type="submit"]');
await page.waitForURL("**/studio");
await page.screenshot({ path: `${out}/meridian_owner_studio.png`, fullPage: true });

await page.goto(`${base}/studio/forge`);
await page.fill("#topic", "Creator monetization");
await page.fill("#audience", "Faceless creators who want digital products");
await page.selectOption("#productType", "Notion kit");
await page.click('button[type="submit"]');
await page.waitForSelector("text=1. Research", { timeout: 20000 });
await page.screenshot({ path: `${out}/meridian_forge_results.png`, fullPage: true });

const openBtn = page.getByRole("button", { name: /Open saved product/i });
if (await openBtn.count()) {
  await openBtn.click();
  await page.waitForURL("**/studio/products/**");
  await page.screenshot({ path: `${out}/meridian_product_launch.png`, fullPage: true });
}

await page.goto(`${base}/checkout`);
await page.waitForSelector("text=Enrollment is closed");
await page.screenshot({ path: `${out}/meridian_checkout_private.png`, fullPage: true });

console.log("OK screenshots written");
await browser.close();
