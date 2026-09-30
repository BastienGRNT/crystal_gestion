import { chromium } from 'playwright';
import { DemoClient } from './demo-client';

/** Keyboard-first flows: Cmd+K search, quick idea capture, peek open/close, "g t" navigation. */
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const client = new DemoClient(BASE);
await client.form('/login', { email: 'bastien@crystal.test', password: 'crystal-demo' });
const [name, value] = client.sessionCookie.split('=');
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addCookies([{ name, value, url: BASE }]);
const page = await context.newPage();
const errors: string[] = [];
page.on('pageerror', (error) => errors.push(error.message));
const check = (ok: boolean, label: string) => console.log(`${ok ? '✓' : '✗'} ${label}`);

await page.goto(`${BASE}/p/atelier-pixel`, { waitUntil: 'networkidle' });
await page.keyboard.press('Control+k');
await page.keyboard.type('Stripe');
await page.waitForTimeout(150);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
check(page.url() !== `${BASE}/p/atelier-pixel`, `Cmd+K search opened ${page.url().replace(BASE, '')}`);

await page.goto(`${BASE}/p/atelier-pixel`, { waitUntil: 'networkidle' });
await page.keyboard.press('i');
await page.keyboard.type('Idée clavier');
await page.keyboard.press('Enter');
await page.waitForTimeout(500);
check((await page.getByText('Idée notée').count()) > 0, 'quick idea captured with I');

await page.goto(`${BASE}/p/atelier-pixel?peek=T-2`, { waitUntil: 'networkidle' });
check((await page.getByRole('complementary', { name: 'Aperçu' }).count()) === 1, 'peek opens from URL');
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
check(!page.url().includes('peek'), 'Escape closes the peek');

await page.keyboard.press('g');
await page.keyboard.press('t');
await page.waitForTimeout(500);
check(page.url().endsWith('/tasks'), 'g t goes to tasks');
check(errors.length === 0, `no page errors ${errors.join(' | ')}`);
await browser.close();
