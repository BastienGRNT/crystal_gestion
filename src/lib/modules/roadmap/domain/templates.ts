import { addDays, daysBetween, weekdayOf, type DateKey } from '../../kernel/domain/dates';

export const TEMPLATE_KEYS = ['express', 'product', 'client', 'empty'] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export interface TemplateTask {
	title: string;
	checklist?: string[];
}

interface TemplateStep {
	title: string;
	doneWhen: string;
	/**
	 * Where it falls between today (0) and the delivery date (1), or days after the delivery
	 * (`{ after }`), or no date at all (`null`: what comes "later").
	 */
	at: number | { after: number } | null;
	tasks: TemplateTask[];
}

export interface ProjectTemplate {
	key: TemplateKey;
	name: string;
	/** Who it is for, in the project dialog. */
	summary: string;
	steps: TemplateStep[];
	channels: string[];
}

const GO_LIVE: TemplateTask = {
	title: 'Mise en production',
	checklist: [
		'Domaine et DNS',
		'HTTPS',
		'Variables et secrets de prod',
		'Sauvegardes testées (restauration comprise)',
		'Monitoring et alertes',
		'Mesure d’audience'
	]
};

const LEGAL: TemplateTask = {
	title: 'Mentions légales, CGV et RGPD',
	checklist: [
		'Mentions légales',
		'CGV / CGU',
		'Politique de confidentialité',
		'Bandeau cookies si besoin'
	]
};

export const TEMPLATES: Record<TemplateKey, ProjectTemplate> = {
	express: {
		key: 'express',
		name: 'Express',
		summary: 'Deux à quatre semaines : on le fait marcher, puis on le met en ligne.',
		channels: [],
		steps: [
			{
				title: 'Ça marche',
				doneWhen: 'Le parcours principal fonctionne de bout en bout.',
				at: 0.7,
				tasks: [
					{ title: 'Lister ce qui doit marcher' },
					{ title: 'Construire le parcours principal' },
					{ title: 'Tester sur téléphone' }
				]
			},
			{
				title: 'En ligne et montré',
				doneWhen: 'C’est en ligne et le client (ou un premier utilisateur) l’a vu.',
				at: 1,
				tasks: [GO_LIVE, { title: 'Le montrer et noter les retours' }]
			}
		]
	},
	product: {
		key: 'product',
		name: 'Produit',
		summary: 'Un produit à nous, de l’idée aux premiers clients payants.',
		channels: ['retours'],
		steps: [
			{
				title: 'Preuve',
				doneWhen: 'On sait que des gens paieraient : au moins la moitié des personnes interrogées.',
				at: 0.1,
				tasks: [
					{ title: 'Lister 10 personnes à interroger' },
					{ title: 'Faire les entretiens' },
					{ title: 'Écrire la promesse en une phrase' }
				]
			},
			{
				title: 'Conception',
				doneWhen: 'Le parcours principal est maquetté et validé à deux.',
				at: 0.25,
				tasks: [
					{ title: 'Maquetter le parcours principal' },
					{ title: 'Modèle de données' },
					{ title: 'Choix techniques (stack, hébergement)' }
				]
			},
			{
				title: 'Le cœur',
				doneWhen: 'Un utilisateur fait l’essentiel de bout en bout.',
				at: 0.6,
				tasks: [
					{ title: 'Comptes et connexion' },
					{ title: 'La fonction principale' },
					{ title: 'Paiement (mode test)' }
				]
			},
			{
				title: 'Bêta privée',
				doneWhen: '5 vrais utilisateurs s’en servent.',
				at: 0.8,
				tasks: [
					{ title: 'Inviter 5 bêta-testeurs' },
					{ title: 'Recueillir les retours dans #retours' },
					{ title: 'Corriger ce qui bloque' }
				]
			},
			{
				title: 'Mise en ligne',
				doneWhen: 'C’est en ligne et on peut payer pour de vrai.',
				at: 1,
				tasks: [GO_LIVE, { title: 'Paiement en mode réel' }, LEGAL]
			},
			{
				title: 'Lancement',
				doneWhen: 'Les premiers clients paient.',
				at: { after: 21 },
				tasks: [
					{ title: 'Page de prix' },
					{ title: 'Contacter 20 prospects' },
					{ title: 'Annoncer le lancement' },
					{ title: 'Noter le premier chiffre de l’indicateur' }
				]
			},
			{
				title: 'Vie du produit',
				doneWhen: 'On écoute, on corrige, on améliore.',
				at: null,
				tasks: [{ title: 'Mettre en place le support (adresse, délai de réponse)' }]
			}
		]
	},
	client: {
		key: 'client',
		name: 'Projet client',
		summary: 'Pour un client : cadrage, maquettes, développement, recette, mise en ligne.',
		channels: [],
		steps: [
			{
				title: 'Cadrage validé',
				doneWhen: 'Le client a validé le périmètre, le prix et le planning.',
				at: 0.1,
				tasks: [
					{ title: 'Recueillir le besoin' },
					{ title: 'Envoyer le devis et le planning' },
					{ title: 'Obtenir la validation écrite' }
				]
			},
			{
				title: 'Maquettes validées',
				doneWhen: 'Le client a validé les maquettes.',
				at: 0.3,
				tasks: [
					{ title: 'Maquetter les écrans clés' },
					{ title: 'Présenter au client' },
					{ title: 'Intégrer ses retours' }
				]
			},
			{
				title: 'Développement',
				doneWhen: 'Tout le périmètre validé fonctionne en préproduction.',
				at: 0.75,
				tasks: [
					{ title: 'Mettre en place la préproduction' },
					{ title: 'Développer les fonctionnalités' },
					{ title: 'Tester sur mobile et navigateurs' }
				]
			},
			{
				title: 'Recette client',
				doneWhen: 'Le client a testé et validé.',
				at: 0.9,
				tasks: [
					{ title: 'Envoyer l’accès de recette' },
					{ title: 'Corriger les retours de recette' },
					{ title: 'Obtenir le PV de recette' }
				]
			},
			{
				title: 'Mise en ligne',
				doneWhen: 'C’est en ligne chez le client.',
				at: 1,
				tasks: [GO_LIVE, LEGAL, { title: 'Transmettre les accès et la documentation' }]
			},
			{
				title: 'Garantie',
				doneWhen: 'La période de garantie est finie et le solde payé.',
				at: null,
				tasks: [{ title: 'Corriger les anomalies signalées' }, { title: 'Facturer le solde' }]
			}
		]
	},
	empty: {
		key: 'empty',
		name: 'Vide',
		summary: 'Sans étapes : tu les poses toi-même, quand tu veux.',
		channels: [],
		steps: []
	}
};

export interface PlannedStep {
	title: string;
	doneWhen: string;
	targetDate: DateKey | null;
	tasks: TemplateTask[];
}

/** The Friday closest to a day: steps end at the end of a week. */
function nearestFriday(day: DateKey): DateKey {
	const offset = 4 - weekdayOf(day);
	return addDays(day, offset < -2 ? offset + 7 : offset);
}

/**
 * The steps of a template, dated between today and the delivery date (rounded to Fridays,
 * the last one on the delivery day itself). Without a delivery date, nothing is dated.
 */
export function planTemplate(
	key: TemplateKey,
	today: DateKey,
	deadline: DateKey | null
): PlannedStep[] {
	const span = deadline ? Math.max(1, daysBetween(today, deadline)) : 0;
	let previous = today;
	return TEMPLATES[key].steps.map((step) => {
		let targetDate: DateKey | null = null;
		if (deadline && step.at !== null) {
			targetDate = stepDate(step.at, today, deadline, span, previous);
			previous = targetDate;
		}
		return { title: step.title, doneWhen: step.doneWhen, targetDate, tasks: step.tasks };
	});
}

function stepDate(
	at: number | { after: number },
	today: DateKey,
	deadline: DateKey,
	span: number,
	previous: DateKey
): DateKey {
	if (typeof at !== 'number') return addDays(deadline, at.after);
	if (at >= 1) return deadline;
	const raw = addDays(today, Math.round(at * span));
	// Before the delivery and after the previous step; a very short project keeps the raw day.
	return [nearestFriday(raw), raw].find((day) => day > previous && day < deadline) ?? raw;
}
