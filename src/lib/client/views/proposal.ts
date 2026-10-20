import { isRef, type OpCommand } from '$lib/modules/assistant/domain/ops';
import type { Op } from '$lib/modules/assistant/domain/proposal';

/** What the review panel shows of an op: what it does, its main text (editable), the rest. */
export interface OpView {
	label: string;
	/** The field the person can rewrite before accepting. */
	field: string | null;
	text: string;
	details: string[];
}

const MAIN: Partial<Record<OpCommand, string>> = {
	'tasks.create': 'title',
	'tasks.update': 'title',
	'chat.comment': 'body',
	'roadmap.createMilestone': 'title',
	'roadmap.updateMilestone': 'doneWhen',
	'roadmap.createDecision': 'text',
	'roadmap.createHypothesis': 'text',
	'roadmap.createMetric': 'name',
	'project.brief': 'text',
	'project.techSpec': 'text',
	'components.create': 'name',
	'framing.createStakeholder': 'name',
	'framing.createInitiative': 'title',
	'framing.createEpic': 'title',
	'framing.createStory': 'want',
	'framing.updateStory': 'want',
	'framing.createSwotItem': 'text',
	'framing.createStrategy': 'text',
	'framing.createTerm': 'definition',
	'framing.createJourney': 'body'
};

const LABELS: Record<OpCommand, string> = {
	'tasks.create': 'Nouvelle tâche',
	'tasks.update': 'Modifier la tâche',
	'chat.comment': 'Commentaire dans le fil',
	'roadmap.createMilestone': 'Nouvelle étape',
	'roadmap.updateMilestone': 'Modifier l’étape',
	'roadmap.createDecision': 'Décision',
	'roadmap.createHypothesis': 'Pari à vérifier',
	'roadmap.createMetric': 'Chiffre de réussite',
	'project.brief': 'Note de cadrage',
	'project.techSpec': 'Cahier des charges technique',
	'components.create': 'Nouveau module',
	'framing.createStakeholder': 'Partie prenante',
	'framing.createInitiative': 'Initiative',
	'framing.createEpic': 'Epic',
	'framing.createStory': 'User story',
	'framing.updateStory': 'Compléter la story',
	'framing.createSwotItem': 'SWOT',
	'framing.createStrategy': 'Stratégie TOWS',
	'framing.createTerm': 'Glossaire',
	'framing.createJourney': 'Parcours'
};

const FIELD_NAMES: Record<string, string> = {
	notes: 'Notes',
	kind: 'Type',
	status: 'Colonne',
	componentId: 'Module',
	milestoneId: 'Étape',
	dueDate: 'Échéance',
	quadrant: 'Priorité',
	checklist: 'Checklist',
	storyId: 'Story',
	epicId: 'Epic',
	doneWhen: 'Fini quand',
	targetDate: 'Date',
	reason: 'Pourquoi',
	why: 'Pourquoi',
	taskId: 'Tâche',
	unit: 'Unité',
	target: 'Cible',
	soThat: 'Afin de',
	personaId: 'Persona',
	criteria: 'Critères',
	role: 'Rôle',
	quadrantSwot: 'Famille',
	itemIds: 'Croise',
	term: 'Terme',
	title: 'Titre',
	description: 'Description',
	organization: 'Organisation',
	expects: 'Attend',
	parentId: 'Dans le module',
	initiativeId: 'Initiative'
};

const VALUES: Record<string, string> = {
	idea: 'Idées',
	todo: 'À faire',
	now: 'Maintenant',
	plan: 'À planifier',
	delegate: 'À déléguer',
	later: 'Plus tard',
	feature: 'Fonctionnalité',
	bug: 'Bug',
	tech: 'Technique',
	action: 'Action'
};

/**
 * Says an op in words. `nameOf` turns an id into what the screens call it (`#12 Titre`); a
 * `$ref` is an item created by another op of the same proposal.
 */
export function describeOp(op: Op, nameOf: (id: string) => string | null): OpView {
	const main = MAIN[op.command] ?? null;
	const show = (value: unknown): string => {
		if (Array.isArray(value))
			return value
				.map((v) =>
					typeof v === 'object' && v ? String((v as { text?: string }).text ?? '') : show(v)
				)
				.join(' · ');
		if (value === null) return '—';
		if (isRef(value)) return 'créé(e) juste au-dessus';
		if (typeof value === 'string') return nameOf(value) ?? VALUES[value] ?? value;
		return String(value);
	};
	const target = typeof op.input.id === 'string' ? nameOf(op.input.id) : null;
	const section = typeof op.input.section === 'string' ? ` · ${op.input.section}` : '';
	const label = `${LABELS[op.command]}${section}${target ? ` · ${target}` : ''}`;
	const details = Object.entries(op.input)
		.filter(([key]) => key !== 'id' && key !== main && key !== 'section')
		.map(([key, value]) => `${FIELD_NAMES[key] ?? key} : ${show(value)}`);
	return {
		label,
		field: main,
		text: main && typeof op.input[main] === 'string' ? (op.input[main] as string) : '',
		details
	};
}
