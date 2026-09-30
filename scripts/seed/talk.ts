import type { DemoClient } from '../demo-client';
import type { Created, Seed } from './context';
import type { Files } from './resources';
import type { Work } from './work';

/** Discussion (threads, replies, open questions), journal entries, ideas and AI notes. */
export async function seedTalk(s: Seed, { features: f, tasks: t }: Work, files: Files) {
	const { bastien, ana, leo, b, a, l, projectId, dateKey } = s;
	const post = (client: DemoClient, body: string, extra: object = {}) =>
		client.command<Created>('messages.post', { projectId, featureId: null, body, ...extra });
	await post(
		bastien,
		`Salut l’équipe ! Le cadrage est posé, on vise la boutique d’abord (#${f.shop.ref}).`
	);
	const question = await post(
		ana,
		`Je m’occupe de #${f.pay.ref}. <@${b}> on part sur Stripe Checkout ou Elements ?`,
		{ isQuestion: true }
	);
	await post(bastien, 'Checkout : moins de code, et la conformité SCA est gérée par Stripe.', {
		replyToId: question.id
	});
	await post(
		leo,
		`<@${b}> tu peux relire les textes d’accueil avant vendredi ? C’est dans #${t.texts.ref}.`,
		{ isQuestion: true }
	);
	await post(leo, `<@${a}> tu as un compte Stripe perso ou on en crée un pour le projet ?`, {
		featureId: f.pay.id,
		isQuestion: true
	});
	await post(
		bastien,
		`Moodboard et vidéo du parcours dans le dossier : #${files.moodboard.ref} #${files.video.ref}`,
		{ featureId: f.shop.id }
	);
	await post(ana, `J’ai mis le cahier des charges à jour (#${files.brief.ref}).`);

	await bastien.command('journal.create', {
		projectId,
		kind: 'decision',
		title: 'Stripe Checkout plutôt qu’Elements',
		featureId: f.pay.id,
		details: {
			rationale: 'Moins de code à maintenir, conformité SCA gérée par Stripe.',
			decidedBy: [a, b],
			decidedOn: dateKey(-1)
		}
	});
	await bastien.command('journal.create', {
		projectId,
		kind: 'decision',
		title: 'Pas de comptes clients en V1',
		featureId: f.shop.id,
		details: {
			rationale: 'Commande en invité : un obstacle de moins avant le premier achat.',
			decidedBy: [b, l],
			decidedOn: dateKey(-3)
		}
	});
	await ana.command('journal.create', {
		projectId,
		kind: 'fix',
		title: 'Images floues sur écran Retina',
		featureId: f.shop.id,
		details: {
			problem: 'Les visuels produits sont flous sur Mac.',
			cause: 'Miniatures générées en 1x.',
			solution: 'Générer des srcset 1x/2x.'
		}
	});
	// Logged automatically in the journal as a change of scope.
	await ana.command('features.update', {
		projectId,
		id: f.insta.id,
		changes: { priority: 'wont' }
	});

	const idea = (client: DemoClient, title: string, featureId: string | null = null) =>
		client.command<Created>('ideas.create', { projectId, title, note: '', featureId });
	await idea(leo, 'Codes promo pour les abonnés');
	await idea(bastien, 'Mode sombre pour la boutique', f.shop.id);
	const csv = await idea(ana, 'Export CSV des commandes');
	await ana.command('ideas.keep', { projectId, id: csv.id });
	const referral = await idea(leo, 'Programme de parrainage');
	await leo.command('ideas.archive', { projectId, id: referral.id, archived: true });

	for (const content of [
		'Ana gère tout ce qui touche au paiement ; Léo aux textes et à l’onboarding.',
		'On déploie le dimanche soir, jamais le vendredi.'
	])
		await bastien.command('aiNotes.create', { projectId, content });
}
