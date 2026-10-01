import type { DemoClient } from '../demo-client';
import type { Created, Seed } from './context';

/** Features of every priority and tasks spread over the four urgency quadrants and all statuses. */
export async function seedWork(s: Seed) {
	const { bastien, ana, leo, b, a, l, projectId, dateKey } = s;
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
		b
	);
	const pay = await feature(
		ana,
		'Paiement Stripe',
		'must',
		'Encaisser par carte via Stripe Checkout.',
		a
	);
	const onboarding = await feature(
		leo,
		'Onboarding guidé',
		'should',
		'Créer sa boutique en 3 étapes.',
		l
	);
	const emails = await feature(
		ana,
		'E-mails de commande',
		'could',
		'Confirmation et expédition, envoyés automatiquement.',
		a
	);
	const insta = await feature(
		bastien,
		'Import Instagram',
		'could',
		'Récupérer les visuels depuis Instagram.',
		b
	);
	await feature(ana, 'App mobile', 'wont', 'Pas pour la V1 : le site mobile suffit.', a);
	await bastien.command('features.update', {
		projectId,
		id: shop.id,
		changes: {
			doneCriteria: `Un visiteur achète un tirage de bout en bout. Paiement : #${pay.ref}.`
		}
	});

	const task = (client: DemoClient, title: string, extra: object = {}) =>
		client.command<Created>('tasks.create', { projectId, title, ...extra });
	const t = {
		product: await task(bastien, 'Maquetter la page produit', {
			featureId: shop.id,
			assigneeIds: [b],
			dueDate: dateKey(1)
		}),
		stripe: await task(ana, 'Créer le compte Stripe et les clés de test', {
			featureId: pay.id,
			assigneeIds: [a],
			dueDate: dateKey(2)
		}),
		webhook: await task(ana, 'Webhook de confirmation de commande', {
			featureId: pay.id,
			assigneeIds: [a, b],
			dueDate: dateKey(6)
		}),
		texts: await task(leo, 'Écrire les textes de l’onboarding', {
			featureId: onboarding.id,
			assigneeIds: [l],
			dueDate: dateKey(9)
		}),
		font: await task(bastien, 'Choisir la typo de la boutique', {
			featureId: shop.id,
			assigneeIds: [b],
			dueDate: dateKey(-1)
		}),
		readme: await task(bastien, 'Mettre à jour le README', { assigneeIds: [b] }),
		import: await task(leo, 'Tester l’import d’une image Instagram', {
			featureId: insta.id,
			assigneeIds: [l]
		}),
		domain: await task(bastien, 'Configurer le nom de domaine', {
			assigneeIds: [b],
			dueDate: dateKey(3)
		}),
		mail: await task(ana, 'Modèle d’e-mail de confirmation', {
			featureId: emails.id,
			assigneeIds: [a],
			dueDate: dateKey(2)
		}),
		about: await task(leo, 'Page « À propos » de l’illustrateur', {
			featureId: shop.id,
			assigneeIds: [l],
			important: false,
			urgent: false
		}),
		terms: await task(bastien, 'Relire les CGV avant la mise en ligne', {
			assigneeIds: [b],
			important: true,
			urgent: true
		})
	};
	const bug = (client: DemoClient, title: string, extra: object) =>
		task(client, title, { isFix: true, ...extra });
	await bug(ana, 'Le panier se vide quand on rafraîchit la page', {
		featureId: shop.id,
		assigneeIds: [a],
		dueDate: dateKey(1)
	});
	await bug(leo, 'Le lien « mot de passe oublié » renvoie une 404', { assigneeIds: [l] });
	// Icebox: product ideas, noted for later.
	for (const [title, featureId] of [
		['Mode sombre pour la boutique', shop.id],
		['Codes promo pour les abonnés', null],
		['Export CSV des commandes', emails.id]
	] as const)
		await task(bastien, title, { featureId, status: 'icebox' });
	await ana.command('tasks.move', { projectId, id: t.stripe.id, status: 'review' });
	await leo.command('tasks.move', { projectId, id: t.texts.id, status: 'in_progress' });
	for (const [client, title, userId] of [
		[bastien, 'Initialiser le dépôt', b],
		[ana, 'Choisir l’hébergeur', a]
	] as const) {
		const done = await task(client, title, { assigneeIds: [userId] });
		await client.command('tasks.finish', { projectId, id: done.id });
	}
	// A finished feature, put away: still readable, out of every list.
	const brand = await feature(leo, 'Logo et charte', 'should', 'Identité visuelle de la V1.', l);
	for (const title of ['Logo provisoire en SVG', 'Palette et typographies'] as const) {
		const done = await task(leo, title, { featureId: brand.id, assigneeIds: [l] });
		await leo.command('tasks.finish', { projectId, id: done.id });
	}
	await leo.command('features.archive', { projectId, id: brand.id, archived: true });
	return { features: { shop, pay, onboarding, emails, insta }, tasks: t };
}

export type Work = Awaited<ReturnType<typeof seedWork>>;
