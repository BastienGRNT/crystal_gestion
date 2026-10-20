import type { OpCommand } from './ops';
import type { ModelSize } from './pricing';

/** What the buttons ask about: the whole project, or one of its items. */
export type TargetKind = 'project' | 'milestone' | 'task' | 'epic' | 'channel';

export interface ActionSpec {
	/** The button: "Demander au chef de projet de…" + this. */
	label: string;
	size: ModelSize;
	target: TargetKind;
	ops: OpCommand[];
	maxTokens: number;
	/** The project context's budget, in tokens. */
	contextBudget: number;
	instruction: string;
	/** Lists every open task's title in the context. */
	withTasks?: boolean;
}

const FRAMING_OPS: OpCommand[] = [
	'project.brief',
	'framing.createStakeholder',
	'roadmap.createHypothesis',
	'roadmap.createMetric'
];

/**
 * Every button of the assistant, one instruction each. They only run on a click; the answer is
 * a proposal the team ticks, edits or drops.
 */
export const ACTIONS = {
	splitStep: {
		label: 'découper cette étape',
		size: 'large',
		target: 'milestone',
		ops: ['tasks.create', 'roadmap.updateMilestone'],
		maxTokens: 12_000,
		contextBudget: 12_000,
		withTasks: true,
		instruction:
			'Découpe l’étape visée en 5 à 15 tâches que des devs reconnaissent : découpage vertical, chacune avec son type (feature, tech, action), son module et une checklist courte de critères testables. Rattache-les à l’étape (milestoneId) et, si une story du cahier des charges correspond, à cette story (storyId). Termine par la checklist de mise en prod si l’étape livre quelque chose. Si le « fini quand » de l’étape est vague, propose de le préciser (roadmap.updateMilestone, sans toucher à la date).'
	},
	refineTask: {
		label: 'reformuler et compléter cette tâche',
		size: 'small',
		target: 'task',
		ops: ['tasks.update', 'tasks.create', 'chat.comment'],
		maxTokens: 4_000,
		contextBudget: 6_000,
		instruction:
			'Réécris la tâche visée au format du tableau : un titre court qui commence par un verbe, le bon type et le module. Propose de remplir chaque champ utile : étape, case de la matrice, échéance réalisable au rythme réel, notes (contexte et critères d’acceptation), checklist, story ou epic du cahier des charges. Si elle est trop grosse, découpe-la (tasks.create, au plus 4). Si une question se pose à l’équipe, ajoute un commentaire dans son fil (chat.comment).'
	},
	refineIdeas: {
		label: 'reformuler les idées',
		size: 'small',
		target: 'project',
		ops: ['tasks.update'],
		maxTokens: 8_000,
		contextBudget: 8_000,
		withTasks: true,
		instruction:
			'Reformule au plus 15 tâches de la colonne Idées (statut idea) : titre court commençant par un verbe, type, module, et une note de contexte si elle manque. Ne change pas leur statut.'
	},
	sortTasks: {
		label: 'trier les tâches',
		size: 'small',
		target: 'project',
		ops: ['tasks.update'],
		maxTokens: 8_000,
		contextBudget: 10_000,
		withTasks: true,
		instruction:
			'Trie les tâches : une case de la matrice (now, plan, delegate, later) pour chaque tâche « à trier » (quadrant vide), avec son pourquoi ; propose les tâches à passer d’idée à faire et l’inverse ; propose des échéances réalisables au rythme réel. Au plus 25 changements.'
	},
	proposeSteps: {
		label: 'proposer les étapes',
		size: 'large',
		target: 'project',
		ops: ['roadmap.createMilestone'],
		maxTokens: 8_000,
		contextBudget: 8_000,
		instruction:
			'Propose 4 à 7 étapes jusqu’à la livraison, chacune avec un « fini quand » vérifiable et une date réaliste au rythme réel (montre le calcul dans la raison). Elles se suivent : la date d’une étape est un budget.'
	},
	completeFraming: {
		label: 'compléter la note de cadrage',
		size: 'large',
		target: 'project',
		ops: FRAMING_OPS,
		maxTokens: 12_000,
		contextBudget: 10_000,
		instruction:
			'Complète la note de cadrage (QQOQCCP) en partant de ses trous. Pose d’abord tes questions en QCM si l’information manque. Ensuite propose un texte par section vide ou trop courte (project.brief, en gardant ce qui est déjà écrit), les parties prenantes qui manquent (au moins qui décide et qui paie), au plus 3 hypothèses et des chiffres de réussite avec cible.'
	},
	completeTechSpec: {
		label: 'compléter le cahier des charges technique',
		size: 'large',
		target: 'project',
		ops: ['project.techSpec'],
		maxTokens: 12_000,
		contextBudget: 10_000,
		instruction:
			'Complète le cahier des charges technique, section par section (project.techSpec), en partant de la note de cadrage (Où, Combien, contraintes) et de ce qui est déjà écrit, que tu gardes. Exigences mesurables (temps de réponse, volumes, niveau d’accessibilité). Pour la « Définition de « fini » », une liste courte. Ne tranche pas le juridique : écris « à vérifier avec… ». Pose tes questions en QCM si la stack ou l’hébergement ne sont pas connus.'
	},
	proposeSwot: {
		label: 'proposer le SWOT et le TOWS',
		size: 'large',
		target: 'project',
		ops: ['framing.createSwotItem', 'framing.createStrategy', 'roadmap.createHypothesis'],
		maxTokens: 10_000,
		contextBudget: 10_000,
		instruction:
			'Propose un SWOT court (au plus 5 éléments par famille, sans doublon avec l’existant), puis les stratégies TOWS qui croisent ces éléments (itemIds avec les $ref des éléments créés ou les ids existants). Chaque menace et chaque faiblesse doit être traitée par une stratégie. Une stratégie qui parie sur quelque chose de non vérifié devient aussi une hypothèse.'
	},
	draftSpec: {
		label: 'proposer les epics et les stories',
		size: 'large',
		target: 'project',
		ops: [
			'framing.createInitiative',
			'framing.createEpic',
			'framing.createStory',
			'framing.createStakeholder',
			'components.create',
			'framing.createTerm'
		],
		maxTokens: 16_000,
		contextBudget: 10_000,
		instruction:
			'Rédige l’ossature du cahier des charges fonctionnel à partir de la note de cadrage : les personas qui manquent (framing.createStakeholder, rôle uses), 1 à 3 initiatives, les epics (rattachées à une initiative et à un module), et pour les epics de la v1 leurs stories (« je veux… afin de… », persona, 1 à 4 critères d’acceptation testables). Les termes du métier vont au glossaire. Au plus 20 stories.'
	},
	writeStories: {
		label: 'écrire les stories de cette epic',
		size: 'large',
		target: 'epic',
		ops: ['framing.createStory', 'framing.updateStory', 'framing.createStakeholder'],
		maxTokens: 10_000,
		contextBudget: 8_000,
		instruction:
			'Écris les user stories de l’epic visée : « je veux… afin de… », le persona (ajoute-le s’il manque), 1 à 5 critères d’acceptation testables (Étant donné / Quand / Alors), et pour chaque critère important un jeu de données et le résultat attendu. Complète les stories existantes qui n’ont pas de critère (framing.updateStory). Au plus 10 stories.'
	},
	sortLoose: {
		label: 'ranger ces tâches',
		size: 'small',
		target: 'project',
		ops: ['tasks.update', 'framing.createStory'],
		maxTokens: 8_000,
		contextBudget: 8_000,
		withTasks: true,
		instruction:
			'Range les fonctionnalités « hors cadrage » (type feature, sans storyId ni epicId) : rattache chacune à la story ou à l’epic qui lui correspond (tasks.update), ou propose une story dans la bonne epic puis rattache la tâche à son $ref. Si aucune ne va, ne propose rien pour elle.'
	},
	whatToCut: {
		label: 'proposer quoi couper',
		size: 'large',
		target: 'milestone',
		ops: ['tasks.update', 'roadmap.updateMilestone', 'roadmap.createDecision'],
		maxTokens: 10_000,
		contextBudget: 12_000,
		withTasks: true,
		instruction:
			'L’étape visée est en retard. Propose 2 ou 3 scénarios chiffrés au rythme réel (dans le résumé) : couper du périmètre (tâches passées en idea ou vers une étape suivante), ou décaler la date. Les ops proposées sont celles du scénario que tu recommandes, avec la décision qui va avec (roadmap.createDecision) et le pourquoi de toute date qui bouge.'
	},
	extractThread: {
		label: 'tirer décisions et tâches de cette discussion',
		size: 'small',
		target: 'channel',
		ops: ['roadmap.createDecision', 'tasks.create'],
		maxTokens: 6_000,
		contextBudget: 6_000,
		instruction:
			'Lis les derniers messages de la discussion visée. Propose les décisions qui y ont été prises (roadmap.createDecision, avec le message en source), les tâches à créer, et liste dans le résumé les questions encore ouvertes. Rien d’autre.'
	},
	healthCheck: {
		label: 'faire le bilan de santé du projet',
		size: 'large',
		target: 'project',
		ops: [
			'tasks.update',
			'tasks.create',
			'roadmap.updateMilestone',
			'roadmap.createDecision',
			'project.brief'
		],
		maxTokens: 10_000,
		contextBudget: 14_000,
		withTasks: true,
		instruction:
			'Fais le bilan de santé du projet à partir des signaux déjà calculés dans le contexte (trous du cadrage, prévision des étapes, bugs bloquants, hypothèses non vérifiées, parties prenantes). Donne un verdict (realistic, at_risk, unrealistic), 3 à 5 constats sourcés dans le résumé, puis les ops qui corrigent le plus important.'
	}
} satisfies Record<string, ActionSpec>;

export type ActionKey = keyof typeof ACTIONS;
export const ACTION_KEYS = Object.keys(ACTIONS) as ActionKey[];
