import { chromium, type Browser } from 'playwright';
import { DemoClient } from './demo-client';

/** Two people on the same board: what one creates or moves appears for the other without reloading. */
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

async function signedInPage(browser: Browser, email: string) {
	const client = new DemoClient(BASE);
	await client.form('/login', { email, password: 'crystal-demo' });
	const [name, value] = client.sessionCookie.split('=');
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	await context.addCookies([{ name, value, url: BASE }]);
	const page = await context.newPage();
	await page.goto(`${BASE}/p/atelier-pixel/tasks`, { waitUntil: 'networkidle' });
	return page;
}

const browser = await chromium.launch();
const bastien = await signedInPage(browser, 'bastien@crystal.test');
const ana = await signedInPage(browser, 'ana@crystal.test');
await bastien.waitForTimeout(500);

const title = `Tâche temps réel ${Date.now()}`;
const started = Date.now();
await bastien.getByPlaceholder('Ajouter').first().fill(title);
await bastien.getByPlaceholder('Ajouter').first().press('Enter');
await ana.getByText(title).waitFor({ timeout: 5000 });
console.log(`✓ creation visible for the other member in ${Date.now() - started} ms`);

const presence = await ana.locator('[aria-label="En ligne"] [title="Bastien"]').count();
console.log(presence ? '✓ presence shows Bastien online' : '✗ presence missing');

await browser.close();
