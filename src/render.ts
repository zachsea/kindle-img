import { chromium, type Browser } from "playwright";
import sharp from "sharp";

// my kindle screen, in future we could allow requests to specify a different size for multi-device support
const WIDTH = 1696;
const HEIGHT = 1272;
const APP_PORT = process.env.PORT ?? 3000;

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const browser = await browserPromise;
    if (browser.isConnected()) return browser;
    browserPromise = null;
  }
  browserPromise = chromium.launch({
    args: ["--no-sandbox"],
  });
  return browserPromise;
}

export async function renderDashboard(): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
  });
  try {
    const page = await context.newPage();
    const url = new URL("/index.html", `http://127.0.0.1:${APP_PORT}`);
    await page.goto(url.toString());
    await page.waitForFunction(() => (window as any).__RENDER_READY__, {
      timeout: 10_000,
    });
    const screenshot = await page.screenshot({ type: "png" });
    return await sharp(screenshot).rotate(90).png().toBuffer();
  } finally {
    await context.close();
  }
}
