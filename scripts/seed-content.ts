import type { DemoClient } from './demo-client';

interface Seed {
	bastien: DemoClient;
	ana: DemoClient;
	leo: DemoClient;
	projectId: string;
	day: (offset: number, hour?: number) => Date;
	dateKey: (offset: number) => string;
}

type Created = { id: string; ref: string };
const me = (client: DemoClient) => client.command<{ id: string }>('identity.updatePreferences', {});

export async function seedContent({ bastien, ana, leo, projectId, day, dateKey }: Seed) {
	const [b, a, l] = await Promise.all([me(bastien), me(ana), me(leo)]);
	const feature = (
		client: DemoClient,
		title: string,
		priority: string,
		description: string,
		ownerId: string
	) =>
		client.command<Created>('features.create', {
			projectId,
			title,
			priority,
			description,
			ownerId,
			doneCriteria: ''
		});
	const shop = await feature(
		bastien,
		'Boutique en ligne',
		'must',
		'Page boutique publique avec les tirages, le panier et le paiement.',
		b.id
	);
	const pay = await feature(
		ana,
		'Paiement Stripe',
		'must',
		'Encaisser par carte via Stripe Checkout. Voir aussi la boutique.',
		a.id
	);
	const onboarding = await feature(
		leo,
		'Onboarding guidé',
		'should',
		'Créer sa boutique en 3 étapes.',
		l.id
	);
	const insta = await feature(
		bastien,
		'Import Instagram',
		'could',
		'Récupérer les visuels depuis Instagram.',
		b.id
	);
	await feature(ana, 'App mobile', 'wont', 'Pas pour la V1.', a.id);
	await bastien.command('features.update', {
		projectId,
		id: shop.id,
		changes: {
			doneCriteria: `Un visiteur peut acheter un tirage de bout en bout. Paiement : #${pay.ref}.`
		}
	});

	const task = (client: DemoClient, title: string, extra: object = {}) =>
		client.command<Created>('tasks.create', { projectId, title, ...extra });
	const t1 = await task(bastien, 'Maquetter la page produit', {
		featureId: shop.id,
		assigneeIds: [b.id],
		dueDate: dateKey(1)
	});
	const t2 = await task(ana, 'Créer le compte Stripe et les clés de test', {
		featureId: pay.id,
		assigneeIds: [a.id],
		dueDate: dateKey(2)
	});
	await task(ana, 'Webhook de confirmation de commande', {
		featureId: pay.id,
		assigneeIds: [a.id, b.id],
		dueDate: dateKey(6)
	});
	await task(leo, 'Écrire les textes de l’onboarding', {
		featureId: onboarding.id,
		assigneeIds: [l.id]
	});
	await task(bastien, 'Choisir la typo de la boutique', {
		featureId: shop.id,
		assigneeIds: [b.id],
		dueDate: dateKey(-1)
	});
	await task(bastien, 'Mettre à jour le README', { assigneeIds: [b.id] });
	await task(leo, 'Tester l’import d’une image Instagram', {
		featureId: insta.id,
		assigneeIds: [l.id]
	});
	await task(bastien, 'Configurer le nom de domaine', { assigneeIds: [b.id], dueDate: dateKey(3) });
	await bastien.command('tasks.move', { projectId, id: t1.id, status: 'in_progress' });
	await ana.command('tasks.move', { projectId, id: t2.id, status: 'review' });
	const done = await task(bastien, 'Initialiser le dépôt', { assigneeIds: [b.id] });
	await bastien.command('tasks.finish', { projectId, id: done.id });
	await bastien.command('time.createBlock', {
		projectId,
		taskId: t1.id,
		startedAt: day(-1, 19).toISOString(),
		endedAt: day(-1, 21).toISOString()
	});
	await ana.command('time.createBlock', {
		projectId,
		taskId: t2.id,
		startedAt: day(-2, 20).toISOString(),
		endedAt: day(-2, 22).toISOString()
	});
	await bastien.command('tasks.start', { projectId, id: t1.id });

	const post = (client: DemoClient, body: string, extra: object = {}) =>
		client.command<Created>('messages.post', { projectId, featureId: null, body, ...extra });
	await post(
		bastien,
		`Salut l’équipe ! Le cadrage est posé, on vise la boutique d’abord (#${shop.ref}).`
	);
	await post(
		ana,
		`Je m’occupe de #${pay.ref}. <@${b.id}> on part sur Stripe Checkout ou Elements ?`,
		{ isQuestion: true }
	);
	await post(leo, `<@${a.id}> tu as un compte Stripe perso ou on en crée un pour le projet ?`, {
		featureId: pay.id,
		isQuestion: true
	});
	await post(bastien, 'Je mets les maquettes dans le dossier de la feature ce soir.', {
		featureId: shop.id
	});

	await bastien.command('journal.create', {
		projectId,
		kind: 'decision',
		title: 'Stripe Checkout plutôt qu’Elements',
		featureId: pay.id,
		details: {
			rationale: 'Moins de code à maintenir, conformité SCA gérée par Stripe.',
			decidedBy: [a.id, b.id],
			decidedOn: dateKey(-1)
		}
	});
	await ana.command('journal.create', {
		projectId,
		kind: 'fix',
		title: 'Images floues sur écran Retina',
		featureId: shop.id,
		details: {
			problem: 'Les visuels produits sont flous sur Mac.',
			cause: 'Miniatures générées en 1x.',
			solution: 'Générer des srcset 1x/2x.'
		}
	});
	await ana.command('features.update', { projectId, id: insta.id, changes: { priority: 'wont' } });

	await leo.command('ideas.create', {
		projectId,
		title: 'Codes promo pour les abonnés',
		note: '',
		featureId: null
	});
	await bastien.command('ideas.create', {
		projectId,
		title: 'Mode sombre pour la boutique',
		note: `Lié à #${shop.ref}`,
		featureId: shop.id
	});
	await ana.command('ideas.create', {
		projectId,
		title: 'Export CSV des commandes',
		note: '',
		featureId: null
	});

	for (const [client, offset, from, to, status] of [
		[bastien, 0, 19, 23, 'available'],
		[ana, 0, 20, 23, 'available'],
		[leo, 0, 14, 17, 'maybe'],
		[bastien, 2, 9, 12, 'available'],
		[ana, 2, 10, 12, 'available'],
		[leo, 3, 19, 22, 'available']
	] as const)
		await client.command('availability.create', {
			startsAt: day(offset, from).toISOString(),
			endsAt: day(offset, to).toISOString(),
			status
		});

	await ana.command('accounts.create', {
		projectId,
		title: 'Stripe',
		login: 'contact@atelierpixel.fr',
		secret: 'sk_test_demo_42',
		url: 'https://dashboard.stripe.com',
		featureId: pay.id
	});
	await bastien.command('links.create', {
		projectId,
		title: 'Maquettes Figma',
		url: 'https://figma.com',
		tag: 'design',
		featureId: shop.id
	});
	await leo.command('contacts.create', {
		projectId,
		title: 'Camille Martin',
		role: 'Illustratrice bêta-testeuse',
		email: 'camille@example.com',
		phone: '06 12 34 56 78'
	});
	await bastien.command('aiNotes.create', {
		projectId,
		content: 'Ana gère tout ce qui touche au paiement ; Léo aux textes et à l’onboarding.'
	});
}
