import { chromium } from 'playwright';
import { DemoClient } from './demo-client';

/**
 * Usage: tsx scripts/screenshots.ts <outDir> <path> [path…]
 * Captures each path in light/dark on desktop and mobile, signed in as the demo user.
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const [outDir, ...paths] = process.argv.slice(2);
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };
const themes = (process.env.THEMES ?? 'light,dark').split(',');
const only = process.env.VIEWPORTS?.split(',');

const client = new DemoClient(BASE);
await client.form('/login', {
	email: process.env.EMAIL ?? 'bastien@crystal.test',
	password: 'crystal-demo'
});
const [name, value] = client.sessionCookie.split('=');
const browser = await chromium.launch();

for (const [viewportName, viewport] of Object.entries(viewports)) {
	if (only && !only.includes(viewportName)) continue;
	for (const theme of themes) {
		const context = await browser.newContext({
			viewport,
			deviceScaleFactor: viewportName === 'mobile' ? 2 : 1
		});
		await context.addCookies([{ name, value, url: BASE }]);
		await context.addInitScript((t) => localStorage.setItem('crystal-theme', t), theme);
		const page = await context.newPage();
		page.on('pageerror', (error) =>
			console.error(`[${viewportName}/${theme}] page error:`, error.message)
		);
		for (const path of paths) {
			await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
			await page.waitForTimeout(400);
			const file = `${outDir}/${path.replace(/[/?=&]+/g, '_').replace(/^_/, '') || 'root'}-${theme}-${viewportName}.png`;
			await page.screenshot({ path: file, fullPage: false });
			console.log(file);
		}
		await context.close();
	}
}
await browser.close();
