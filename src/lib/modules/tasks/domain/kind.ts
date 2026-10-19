import type { Task, TaskKind } from './task';

export const fold = (text: string) =>
	text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'").toLowerCase();

/** The Conventional Commits prefixes people already type: `fix: …`, `bug!: …`, `feat: …`. */
const PREFIXES: Record<string, TaskKind> = {
	feat: 'feature',
	feature: 'feature',
	bug: 'bug',
	fix: 'bug',
	hotfix: 'bug',
	tech: 'tech',
	chore: 'tech',
	refacto: 'tech',
	refactor: 'tech',
	perf: 'tech',
	ci: 'tech',
	deps: 'tech',
	test: 'tech',
	action: 'action'
};

export interface KindPrefix {
	kind: TaskKind;
	critical: boolean;
	rest: string;
}

/** `bug!: le paiement plante` → a blocking bug titled "le paiement plante". */
export function readPrefix(text: string): KindPrefix | null {
	const match = text.match(/^\s*([a-zA-Z]+)(!)?\s*:\s*(.*)$/s);
	if (!match) return null;
	const kind = PREFIXES[match[1].toLowerCase()];
	if (!kind) return null;
	return { kind, critical: kind === 'bug' && !!match[2], rest: match[3] };
}

const STARTS: [TaskKind, string[]][] = [
	[
		'bug',
		[
			'corrig',
			'fix',
			'bug',
			'plante',
			'crash',
			'erreur',
			'cass',
			'ne marche',
			'ne fonctionne',
			"ne s'affiche",
			'regression',
			'500 '
		]
	],
	[
		'tech',
		[
			'refacto',
			'migrer',
			'migration',
			'mettre a jour',
			'maj ',
			'dependances',
			'ci ',
			'tests',
			'sauvegarde',
			'monitoring',
			'optimiser',
			'nettoyer'
		]
	],
	[
		'action',
		[
			'appeler',
			'relancer',
			'envoyer',
			'facturer',
			'devis',
			'reunion',
			'rediger',
			'montrer',
			'demander',
			'rdv ',
			'prendre rendez',
			'payer',
			'signer',
			'contacter',
			'repondre'
		]
	]
];

/** A sensible kind from the first words, so a quick line needs no extra click. */
export function guessKind(title: string): TaskKind {
	const text = `${fold(title).trim()} `;
	for (const [kind, starts] of STARTS) if (starts.some((s) => text.startsWith(s))) return kind;
	if (/\b(bug|plante|crash|ne marche plus|ne s'affiche plus)\b/.test(text)) return 'bug';
	return 'feature';
}

const BRANCH_PREFIX: Record<TaskKind, string | null> = {
	feature: 'feat',
	bug: 'fix',
	tech: 'chore',
	action: null
};

const STOP_WORDS = new Set(
	'le la les l de du des d un une et a au aux pour sur dans en par avec qui que ne pas plus'.split(
		' '
	)
);

function slug(title: string, words = 4) {
	return fold(title)
		.replace(/[^a-z0-9]+/g, ' ')
		.split(' ')
		.filter((w) => w && !STOP_WORDS.has(w))
		.slice(0, words)
		.join('-')
		.slice(0, 40)
		.replace(/-+$/, '');
}

/** `fix/12-horaires-samedi`: the branch to create, null for work outside the code. */
export function branchName(task: Pick<Task, 'kind' | 'number' | 'title'>): string | null {
	const prefix = BRANCH_PREFIX[task.kind];
	if (!prefix) return null;
	const name = slug(task.title);
	return `${prefix}/${task.number}${name ? `-${name}` : ''}`;
}

/** `fix(rdv): horaires du samedi (#12)`, ready for `git commit -m`. */
export function commitMessage(
	task: Pick<Task, 'kind' | 'number' | 'title'>,
	component?: string | null
): string | null {
	const prefix = BRANCH_PREFIX[task.kind];
	if (!prefix) return null;
	const scope = component ? `(${slug(component, 2)})` : '';
	const title = task.title.charAt(0).toLowerCase() + task.title.slice(1);
	return `${prefix}${scope}: ${title} (#${task.number})`;
}
