/**
 * Demo data through the real API: `npm run dev`, then `npm run seed` (once: the demo accounts must not exist).
 * Sign in with bastien@crystal.test (or camille@crystal.test) / crystal-demo.
 */
import { Client } from './client';
import { architecture, brief, catalogue, logoSvg, mockupSvg, simplePdf } from './seed/samples';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const PASSWORD = 'crystal-demo';

type Task = { id: string; number: number };
type Entity = { id: string };

const day = (offset: number) => {
	const date = new Date();
	date.setDate(date.getDate() + offset);
	return date.toISOString().slice(0, 10);
};

async function main() {
	const bastien = new Client(BASE);
	const camille = new Client(BASE);
	await bastien.form('/inscription', {
		name: 'Bastien Grenot',
		email: 'bastien@crystal.test',
		password: PASSWORD
	});

	const atelier = await bastien.command<Entity & { slug: string }>('projects.create', {
		id: crypto.randomUUID(),
		name: 'Atelier Pixel',
		description: 'Le site vitrine et la boutique de l’atelier de céramique de Léa.',
		color: 0,
		deadline: day(18)
	});
	const recolte = await bastien.command<Entity>('projects.create', {
		id: crypto.randomUUID(),
		name: 'Appli Récolte',
		description: 'Une appli mobile pour suivre son potager. Side project du soir.',
		color: 3
	});
	// Camille joins both projects with their invitation links.
	const invite = async (projectId: string) =>
		(await bastien.command<{ token: string }>('projects.invite', { projectId })).token;
	await camille.form(`/invite/${await invite(atelier.id)}?/register`, {
		name: 'Camille Moreau',
		email: 'camille@crystal.test',
		password: PASSWORD
	});
	await camille.form(`/invite/${await invite(recolte.id)}?/join`, {});
	await bastien.command('projects.update', {
		id: atelier.id,
		weekGoal: 'Mettre le paiement en ligne et envoyer la maquette à Léa'
	});

	const users = await fetchUsers(bastien);
	const B = users.bastien;
	const C = users.camille;

	const task = (who: Client, projectId: string, title: string, extra: object = {}) =>
		who.command<Task>('tasks.create', { id: crypto.randomUUID(), projectId, title, ...extra });
	const update = (who: Client, t: Task, patch: object) =>
		who.command('tasks.update', { id: t.id, ...patch });

	// Atelier Pixel
	const stripe = await task(bastien, atelier.id, 'Intégrer Stripe Checkout', {
		quadrant: 'now',
		assigneeId: B
	});
	await update(bastien, stripe, { status: 'done' });
	const about = await task(camille, atelier.id, 'Page « À propos » avec les photos de l’atelier', {
		quadrant: 'plan',
		assigneeId: C
	});
	await update(camille, about, { status: 'done' });
	const safari = await task(bastien, atelier.id, 'Corriger le paiement qui échoue sur Safari', {
		quadrant: 'now',
		dueDate: day(1),
		notes:
			'Reproduit sur iPhone (iOS 18) : la redirection 3-D Secure revient sur une page blanche.',
		checklist: [
			{ id: 's1', text: 'Reproduire en local', done: true },
			{ id: 's2', text: 'Tester SameSite=Lax sur le cookie', done: false },
			{ id: 's3', text: 'Vérifier sur un vrai iPhone', done: false }
		]
	});
	await update(bastien, safari, { status: 'doing' });
	await task(bastien, atelier.id, 'Envoyer la maquette de la page produit à Léa', {
		quadrant: 'now',
		assigneeId: C,
		dueDate: day(0)
	});
	const cart = await task(camille, atelier.id, 'Écrire les tests du panier', {
		quadrant: 'plan',
		assigneeId: B
	});
	const webp = await task(camille, atelier.id, 'Optimiser les images du catalogue (WebP)', {
		quadrant: 'plan',
		assigneeId: C
	});
	await update(camille, webp, { status: 'doing' });
	await update(camille, webp, { status: 'review' });
	const prod = await task(camille, atelier.id, 'Préparer la mise en production', {
		quadrant: 'plan',
		assigneeId: B,
		dueDate: day(16)
	});
	const carrier = await task(
		bastien,
		atelier.id,
		'Répondre au mail du transporteur (tarifs Colissimo)',
		{ quadrant: 'delegate', assigneeId: C, dueDate: day(2) }
	);
	await update(camille, carrier, { status: 'doing' });
	await update(camille, carrier, {
		blockedReason: 'En attente de la grille tarifaire de La Poste'
	});
	const domain = await task(camille, atelier.id, 'Renouveler le nom de domaine', {
		quadrant: 'delegate',
		dueDate: day(5)
	});
	await task(bastien, atelier.id, 'Mode sombre pour l’admin', { quadrant: 'later' });
	await task(camille, atelier.id, 'Ajouter des stats de visite (Plausible)');
	const legal = await task(bastien, atelier.id, 'Relire les mentions légales et les CGV');
	for (const idea of [
		'Programme fidélité : une tasse offerte toutes les dix',
		'Newsletter mensuelle avec les nouvelles pièces',
		'Vidéos courtes de tournage pour Instagram'
	])
		await task(camille, atelier.id, idea, { status: 'idea' });
	await camille.command('chat.comment', {
		id: crypto.randomUUID(),
		taskId: cart.id,
		body: `<@${B}> je t’ai mis les cas limites dans les notes, dis-moi si c’est clair.`
	});

	// Appli Récolte
	const photo = await task(camille, recolte.id, 'Bug : la photo ne s’enregistre pas sur Android', {
		quadrant: 'now',
		assigneeId: C
	});
	await update(camille, photo, { status: 'doing' });
	await task(camille, recolte.id, 'Choisir entre Expo et Capacitor', {
		quadrant: 'plan',
		assigneeId: B,
		dueDate: day(6)
	});
	await task(bastien, recolte.id, 'Schéma de base des plantations', {
		quadrant: 'plan',
		assigneeId: C
	});
	await task(bastien, recolte.id, 'Rappels d’arrosage selon la météo', { status: 'idea' });

	// Documents
	const svg = 'image/svg+xml';
	const folder = (who: Client, projectId: string, name: string, parentId: string | null = null) =>
		who.command<Entity>('folders.create', { id: crypto.randomUUID(), projectId, parentId, name });
	const design = await folder(camille, atelier.id, 'Design');
	const mockups = await folder(camille, atelier.id, 'Maquettes', design.id);
	const admin = await folder(bastien, atelier.id, 'Client et contrats');
	await camille.upload(
		'logo-atelier-pixel.svg',
		svg,
		logoSvg('A', '#c2683f'),
		atelier.id,
		design.id
	);
	await camille.upload(
		'page-accueil-v2.svg',
		svg,
		mockupSvg('Atelier Pixel', '#c2683f'),
		atelier.id,
		mockups.id
	);
	await bastien.upload(
		'devis-signe.pdf',
		'application/pdf',
		simplePdf([
			'Devis - Atelier Pixel',
			'Site vitrine + boutique : 4 800 EUR HT',
			'Livraison prevue dans 3 semaines'
		]),
		atelier.id,
		admin.id
	);
	await bastien.upload('brief-client.md', 'text/markdown', brief, atelier.id, admin.id);
	await camille.upload('catalogue-produits.csv', 'text/csv', catalogue, atelier.id, null);
	await bastien.upload('notes-architecture.md', 'text/markdown', architecture, recolte.id, null);

	// Accès
	const entry = (who: Client, projectId: string, fields: object) =>
		who.command('vault.create', { id: crypto.randomUUID(), projectId, notes: '', ...fields });
	await entry(bastien, atelier.id, {
		name: 'Stripe (prod)',
		url: 'dashboard.stripe.com',
		username: 'lea@atelierpixel.fr',
		secret: 'Terracotta-42!sauge',
		notes: 'Double authentification sur le téléphone de Léa : la prévenir avant de se connecter.'
	});
	await entry(bastien, atelier.id, {
		name: 'OVH, nom de domaine',
		url: 'ovh.com/manager',
		username: 'gl12345-ovh',
		secret: 'Kq8-vT2!mZ7wPa'
	});
	await entry(camille, atelier.id, {
		name: 'Vercel',
		url: 'vercel.com',
		username: 'equipe@crystal.test',
		secret: 'uJ4_nR9-cB6!xQ'
	});
	await entry(camille, atelier.id, {
		name: 'Maquettes Figma',
		url: 'figma.com/design/atelier-pixel'
	});
	await entry(camille, recolte.id, {
		name: 'Supabase',
		url: 'supabase.com/dashboard',
		username: 'camille@crystal.test',
		secret: 'pot4ger-Rad1s!'
	});

	// Discussion
	const channels = (await loadSnapshot(bastien)).channels;
	const general = channels.find((c) => c.projectId === atelier.id && c.kind === 'general')!;
	const release = await bastien.command<Entity>('channels.create', {
		id: crypto.randomUUID(),
		projectId: atelier.id,
		name: 'mise en prod'
	});
	const post = (who: Client, channelId: string, body: string, fileIds: string[] = []) =>
		who.command<Entity>('chat.post', { id: crypto.randomUUID(), channelId, body, fileIds });
	await post(
		camille,
		general.id,
		'Salut ! J’ai mis mes dispos de la semaine dans le planning. Mercredi après-midi je suis là si on veut faire le point.'
	);
	const question = await post(
		bastien,
		general.id,
		`<@${C}> tu peux regarder le mail du transporteur ? Je reste sur le bug Safari ce soir.`
	);
	await camille.command('chat.post', {
		id: crypto.randomUUID(),
		channelId: general.id,
		body: 'Ça marche, je m’en occupe demain matin.',
		replyToId: question.id
	});
	await post(
		bastien,
		general.id,
		`#${safari.number} avance : c’est la redirection 3-D Secure qui perd la session. Je teste ça :\n\`\`\`ts\nconst session = await stripe.checkout.sessions.create({\n  mode: 'payment',\n  success_url: \`\${origin}/merci\`\n});\n\`\`\``
	);
	const mockup = await camille.upload(
		'maquette-page-produit.svg',
		svg,
		mockupSvg('Tasse sauge', '#7d9a7e'),
		atelier.id,
		null,
		true
	);
	const cream = await post(
		camille,
		general.id,
		`Voilà la maquette de la page produit. <@${B}> on garde le fond crème ?`,
		[mockup.id]
	);
	await post(
		bastien,
		release.id,
		'Checklist avant la mise en ligne : DNS, emails transactionnels, sauvegardes. Je la complète au fil de l’eau.'
	);

	// Feuille de route: the cap, the steps (the first one closed) and a decision from the chat
	await bastien.command('projects.update', {
		id: atelier.id,
		audience: 'Les clients de l’atelier de Léa, souvent sur leur téléphone',
		problem: 'Léa ne vend que sur les marchés et par messages Instagram',
		payer: 'Léa : 4 800 € HT, devis signé',
		outOfScope: 'Application mobile\nGestion des stocks en temps réel',
		metricName: 'Commandes en ligne',
		metricTarget: 20
	});
	const milestone = (title: string, doneWhen: string, targetDate: string) =>
		bastien.command<Entity>('roadmap.createMilestone', {
			id: crypto.randomUUID(),
			projectId: atelier.id,
			title,
			doneWhen,
			targetDate
		});
	const mockupsStep = await milestone(
		'Maquettes validées',
		'Léa a validé l’accueil et la page produit',
		day(-4)
	);
	const shop = await milestone(
		'Boutique en ligne',
		'On commande et on paie une tasse de bout en bout, sur téléphone',
		day(10)
	);
	const live = await milestone(
		'Mise en ligne',
		'Le site est en ligne sur atelierpixel.fr',
		day(18)
	);
	for (const t of [stripe, about, safari, cart, webp, carrier])
		await update(bastien, t, { milestoneId: shop.id });
	for (const t of [prod, domain, legal]) await update(bastien, t, { milestoneId: live.id });
	await camille.command('roadmap.closeMilestone', { id: mockupsStep.id, carry: 'next' });
	await bastien.command('roadmap.createDecision', {
		id: crypto.randomUUID(),
		projectId: atelier.id,
		text: 'On garde le fond crème sur tout le site',
		why: 'C’est la couleur des emballages de l’atelier',
		messageId: cream.id
	});
	await bastien.command('roadmap.applyTemplate', {
		projectId: recolte.id,
		template: 'product',
		today: day(0),
		deadline: day(120)
	});
	const bet = await camille.command<Entity>('roadmap.createHypothesis', {
		id: crypto.randomUUID(),
		projectId: recolte.id,
		text: 'Les jardiniers amateurs paieront 3 € par mois'
	});
	await camille.command('roadmap.verifyHypothesis', { id: bet.id });

	// Planning: this week and last week, plus planned work
	const at = (offset: number, hour: number, minute = 0) => {
		const date = new Date();
		date.setDate(date.getDate() + offset);
		date.setHours(hour, minute, 0, 0);
		return date.toISOString();
	};
	const slot = (who: Client, offset: number, from: number, to: number, status = 'available') =>
		who.command('slots.create', {
			id: crypto.randomUUID(),
			startsAt: at(offset, from),
			endsAt: at(offset, to),
			status
		});
	for (const offset of [-7, -6, -5, -1, 0, 1, 2, 3]) await slot(bastien, offset, 19, 23);
	await slot(bastien, 4, 10, 13, 'maybe');
	for (const offset of [-6, -4, 0, 2]) await slot(camille, offset, 14, 18);
	for (const offset of [-1, 0, 1, 3]) await slot(camille, offset, 20, 23);
	await bastien.command('blocks.create', {
		id: crypto.randomUUID(),
		projectId: atelier.id,
		taskId: safari.id,
		startsAt: at(0, 20),
		endsAt: at(0, 22, 30)
	});
	await camille.command('blocks.create', {
		id: crypto.randomUUID(),
		projectId: atelier.id,
		taskId: webp.id,
		startsAt: at(0, 14, 30),
		endsAt: at(0, 17)
	});

	await camille.command('me.update', { status: 'focus', statusNote: 'Sur les images jusqu’à 18h' });
	console.log(
		`Démo prête sur ${BASE} : bastien@crystal.test / ${PASSWORD} (ou camille@crystal.test)`
	);
}

async function fetchUsers(client: Client) {
	const snapshot = await loadSnapshot(client);
	const id = (email: string) => snapshot.users.find((u) => u.email === email)!.id;
	return { bastien: id('bastien@crystal.test'), camille: id('camille@crystal.test') };
}

interface Snapshot {
	users: { id: string; email: string }[];
	channels: { id: string; kind: string; projectId: string }[];
}

async function loadSnapshot(client: Client): Promise<Snapshot> {
	const response = await fetch(`${BASE}/api/snapshot`, {
		headers: { cookie: client.sessionCookie }
	});
	if (!response.ok) throw new Error(`snapshot → ${response.status}`);
	return response.json();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
