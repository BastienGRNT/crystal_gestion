import { join } from 'node:path';
import type { Seed } from './context';
import { renderMedia } from './media';
import type { Work } from './work';

/** Shared accounts, links, contacts and files (one per preview kind), in folders and in Général. */
export async function seedResources(s: Seed, { features: f }: Work) {
	const { bastien, ana, leo, projectId } = s;
	await ana.command('accounts.create', {
		projectId,
		title: 'Stripe',
		login: 'contact@atelierpixel.fr',
		secret: 'sk_test_demo_42',
		url: 'https://dashboard.stripe.com',
		featureId: f.pay.id
	});
	await bastien.command('accounts.create', {
		projectId,
		title: 'Hébergeur (OVH)',
		login: 'atelierpixel',
		secret: 'demo-ovh-2026',
		url: 'https://www.ovh.com/manager',
		featureId: null
	});
	for (const [title, url, tag, featureId] of [
		['Maquettes Figma', 'https://figma.com', 'design', f.shop.id],
		['Doc Stripe Checkout', 'https://docs.stripe.com/payments/checkout', 'dev', f.pay.id],
		['Dépôt GitHub', 'https://github.com', 'dev', null]
	] as const)
		await bastien.command('links.create', { projectId, title, url, tag, featureId });
	await leo.command('contacts.create', {
		projectId,
		title: 'Camille Martin',
		role: 'Illustratrice bêta-testeuse',
		email: 'camille@example.com',
		phone: '06 12 34 56 78'
	});
	await ana.command('contacts.create', {
		projectId,
		title: 'Support Stripe',
		role: 'Aide sur les paiements',
		email: 'support@stripe.com',
		phone: ''
	});
	const dir = await renderMedia();
	const upload = (name: string, type: string, featureId: string | null) =>
		bastien.upload(projectId, join(dir, name), type, featureId);
	return {
		moodboard: await upload('moodboard.png', 'image/png', f.shop.id),
		brief: await upload('cahier-des-charges.pdf', 'application/pdf', null),
		video: await upload('parcours-achat.webm', 'video/webm', f.shop.id),
		notes: await upload('notes-reunion.txt', 'text/plain', null)
	};
}

export type Files = Awaited<ReturnType<typeof seedResources>>;
