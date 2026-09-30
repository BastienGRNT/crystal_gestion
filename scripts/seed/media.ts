import { mkdtempSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const moodboard = `<body style="margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px;background:#f3f0e8;height:100vh;box-sizing:border-box;font:600 22px Georgia">
${['#3d2bff', '#ff4d6d', '#ffb020', '#1fc7b6', '#15141a', '#c13bff'].map((c, i) => `<div style="background:${c};border-radius:14px;display:flex;align-items:end;padding:14px;color:white">${['Outremer', 'Corail', 'Ambre', 'Lagon', 'Encre', 'Prune'][i]}</div>`).join('')}</body>`;
const brief = `<body style="font:15px/1.6 Georgia;padding:48px;color:#15141a"><h1>Atelier Pixel — cahier des charges</h1>
<p><b>Objectif :</b> permettre aux illustrateurs de vendre leurs tirages en 10 minutes.</p>
<h2>Parcours</h2><ol><li>Créer sa boutique</li><li>Publier 3 tirages</li><li>Encaisser une commande (Stripe Checkout)</li></ol>
<h2>Hors périmètre</h2><p>Marketplace multi-vendeurs, app mobile native.</p></body>`;
const video = `<body style="margin:0;height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#3d2bff,#ff4d6d);color:white;font:44px Georgia">
<div id="t">Parcours d’achat</div><script>let n=0;setInterval(()=>document.getElementById('t').textContent=['Choisir un tirage','Panier','Paiement','Merci !'][n++%4],700)</script></body>`;

/** Real sample files for the demo: they exercise the image, PDF, video and text previews. */
export async function renderMedia() {
	const dir = mkdtempSync(join(tmpdir(), 'crystal-seed-'));
	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
	await page.setContent(moodboard);
	await page.screenshot({ path: join(dir, 'moodboard.png') });
	await page.setContent(brief);
	await page.pdf({ path: join(dir, 'cahier-des-charges.pdf'), format: 'A4' });
	const recorder = await browser.newContext({
		recordVideo: { dir: join(dir, 'rec'), size: { width: 640, height: 360 } }
	});
	const recording = await recorder.newPage();
	await recording.setContent(video);
	await recording.waitForTimeout(3200);
	await recorder.close();
	await browser.close();
	renameSync(join(dir, 'rec', readdirSync(join(dir, 'rec'))[0]), join(dir, 'parcours-achat.webm'));
	writeFileSync(
		join(dir, 'notes-reunion.txt'),
		'Réunion du lundi\n- valider la maquette (#T-1)\n- choisir la palette du moodboard\n- Ana : clés Stripe de test\n'
	);
	return dir;
}
