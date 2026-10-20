import type { DateKey } from '../../kernel/domain/dates';
import type {
	Epic,
	Initiative,
	Journey,
	Stakeholder,
	Story,
	Strategy,
	SwotItem,
	Term
} from '../../framing/domain/framing';
import { briefSections, techSections, type Project } from '../../projects/domain/project';
import type { Decision } from '../../roadmap/domain/decision';
import type { Hypothesis } from '../../roadmap/domain/hypothesis';
import type { Metric } from '../../roadmap/domain/metric';
import { currentMilestones, orderMilestones, type Milestone } from '../../roadmap/domain/milestone';
import type { Component } from '../../tasks/domain/component';
import type { Task } from '../../tasks/domain/task';
import type { TargetKind } from './actions';

/**
 * What the assistant may know of a project. Never the vault, never a password: the reader that
 * fills this does not even load them. Long texts (task notes, documents) stay out, except for
 * the one item a button targets.
 */
export interface ProjectData {
	project: Project;
	today: DateKey;
	members: { id: string; name: string }[];
	milestones: Milestone[];
	tasks: Task[];
	decisions: Decision[];
	hypotheses: Hypothesis[];
	metrics: Metric[];
	components: Component[];
	initiatives: Initiative[];
	epics: Epic[];
	stories: Story[];
	stakeholders: Stakeholder[];
	swot: SwotItem[];
	strategies: Strategy[];
	terms: Term[];
	journeys: Journey[];
	/** The discussion a button targets, oldest first. */
	messages?: { id: string; author: string; body: string; at: string }[];
}

export interface BuiltContext {
	text: string;
	/** Short names (`#12`, `M2`, `E1`, `US-7`…) the model writes, and the ids they stand for. */
	aliases: Map<string, string>;
}

/** About 3.5 characters per token in French: close enough to keep a budget. */
export const tokensOf = (text: string) => Math.ceil(text.length / 3.5);

const byPosition = <T extends { position: number }>(items: T[]) =>
	[...items].sort((a, b) => a.position - b.position);
const oneLine = (text: string, max = 160) => {
	const flat = text.replace(/\s+/g, ' ').trim();
	return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};
const WEEK = 7 * 86_400_000;

/** Features and tech work finished per week, over the last four: the only pace there is. */
export function pacePerWeek(tasks: Task[], now: Date): number | null {
	const since = now.getTime() - 4 * WEEK;
	const done = tasks.filter(
		(t) =>
			(t.kind === 'feature' || t.kind === 'tech') &&
			t.completedAt &&
			Date.parse(t.completedAt) >= since
	);
	return done.length < 3 ? null : Math.round((done.length / 4) * 10) / 10;
}

class Aliases {
	map = new Map<string, string>();
	private names = new Map<string, string>();
	name(prefix: string, id: string, fixed?: string) {
		const known = this.names.get(id);
		if (known) return known;
		const alias =
			fixed ??
			`${prefix}${[...this.names.values()].filter((n) => n.startsWith(prefix)).length + 1}`;
		this.names.set(id, alias);
		this.map.set(alias, id);
		return alias;
	}
	of(id: string | null | undefined) {
		return id ? (this.names.get(id) ?? null) : null;
	}
}

function section(title: string, lines: string[]) {
	return lines.length ? `## ${title}\n${lines.join('\n')}\n` : '';
}

/**
 * The project as compact text, the most useful first, cut to the action's budget. Every item
 * carries a short name the answer uses to point at it; the server turns it back into its id.
 */
export function buildContext(
	data: ProjectData,
	budget: number,
	options: { withTasks?: boolean; now: Date }
): BuiltContext {
	const a = new Aliases();
	const p = data.project;
	const brief = briefSections(p.brief);
	const tech = techSections(p.techSpec);
	const steps = orderMilestones(data.milestones);
	const current = new Set(currentMilestones(data.milestones).map((m) => m.id));
	const modules = byPosition(data.components.filter((c) => !c.archivedAt));
	modules.forEach((c) => a.name('C', c.id));
	steps.forEach((m) => a.name('M', m.id));
	byPosition(data.stakeholders).forEach((s) => a.name('P', s.id));
	byPosition(data.initiatives).forEach((i) => a.name('I', i.id));
	byPosition(data.epics).forEach((e) => a.name('E', e.id));
	data.stories.forEach((s) => a.name('US-', s.id, `US-${s.number}`));
	data.tasks.forEach((t) => a.name('#', t.id, `#${t.number}`));
	byPosition(data.swot).forEach((s) => a.name('W', s.id));
	data.hypotheses.forEach((h) => a.name('H', h.id));
	data.metrics.forEach((m) => a.name('N', m.id));

	const open = data.tasks.filter((t) => t.status !== 'done');
	const pace = pacePerWeek(data.tasks, options.now);
	const stepLine = (m: Milestone) => {
		const own = data.tasks.filter((t) => t.milestoneId === m.id && t.status !== 'idea');
		const done = own.filter((t) => t.status === 'done').length;
		const state = m.closedAt ? 'close' : current.has(m.id) ? 'en cours' : 'à venir';
		return `${a.of(m.id)} ${m.title} · ${state} · ${done}/${own.length} tâches${m.targetDate ? ` · cible ${m.targetDate}` : ''}${m.doneWhen ? ` · fini quand : ${oneLine(m.doneWhen, 200)}` : ' · fini quand : (vide)'}${m.componentId ? ` · module ${a.of(m.componentId)}` : ''}`;
	};
	const taskLine = (t: Task) =>
		`${a.of(t.id)} ${oneLine(t.title, 120)} · ${t.kind} · ${t.status}${t.quadrant ? ` · ${t.quadrant}` : ' · à trier'}${t.milestoneId ? ` · ${a.of(t.milestoneId)}` : ''}${t.componentId ? ` · ${a.of(t.componentId)}` : ''}${t.storyId ? ` · ${a.of(t.storyId)}` : t.epicId ? ` · ${a.of(t.epicId)}` : ''}${t.dueDate ? ` · échéance ${t.dueDate}` : ''}${t.critical ? ' · BLOQUANT' : ''}${t.blockedReason ? ` · bloqué : ${oneLine(t.blockedReason, 80)}` : ''}`;

	const parts = [
		`# ${p.name} (${p.kind}) · aujourd’hui ${data.today}\n${p.description ? `${oneLine(p.description, 300)}\n` : ''}Livraison : ${p.deadline ?? 'pas de date'}${p.soldDays ? ` · ${p.soldDays} jours vendus` : ''} · équipe : ${data.members.map((m) => m.name.split(' ')[0]).join(', ')} · rythme réel : ${pace === null ? 'pas encore assez de recul' : `${pace} tâches (feature + tech) par semaine`} · ${open.filter((t) => t.status !== 'idea').length} tâches ouvertes\n`,
		section(
			'Note de cadrage (QQOQCCP)',
			Object.entries(brief).map(([h, text]) => `- ${h} : ${text ? oneLine(text, 600) : '(vide)'}`)
		),
		section(
			'Cahier des charges technique',
			Object.entries(tech)
				.filter(([, text]) => text)
				.map(([h, text]) => `- ${h} : ${oneLine(text, 300)}`)
		),
		section(
			'Parties prenantes',
			byPosition(data.stakeholders).map(
				(s) =>
					`${a.of(s.id)} ${s.name}${s.organization ? ` (${s.organization})` : ''} · ${s.role} · influence ${s.influence} · intérêt ${s.interest}${s.expects ? ` · attend : ${oneLine(s.expects, 120)}` : ''}`
			)
		),
		section(
			'Modules',
			modules.map(
				(c) =>
					`${a.of(c.id)} ${c.name}${c.parentId ? ` (dans ${a.of(c.parentId)})` : ''}${c.description ? ` : ${oneLine(c.description, 120)}` : ''}`
			)
		),
		section('Étapes, dans l’ordre', steps.map(stepLine)),
		section(
			'Chiffres de réussite',
			data.metrics
				.filter((m) => !m.archivedAt)
				.map(
					(m) =>
						`${a.of(m.id)} ${m.name}${m.target !== null ? ` · cible ${m.target} ${m.unit}` : ' · sans cible'}`
				)
		),
		section(
			'Hypothèses',
			data.hypotheses.map(
				(h) => `${a.of(h.id)} ${h.text} · ${h.verdict === 'open' ? 'à vérifier' : h.verdict}`
			)
		),
		section(
			'Dernières décisions',
			[...data.decisions]
				.sort((x, y) => y.decidedAt.localeCompare(x.decidedAt))
				.slice(0, 10)
				.map((d) => `- ${d.decidedAt.slice(0, 10)} : ${oneLine(d.text, 200)}`)
		),
		section('Cahier des charges fonctionnel : initiatives, epics, stories', [
			...byPosition(data.initiatives).map((i) => `${a.of(i.id)} initiative : ${i.title}`),
			...byPosition(data.epics).map(
				(e) =>
					`${a.of(e.id)} epic : ${e.title}${e.later ? ' (plus tard)' : ''}${e.initiativeId ? ` · ${a.of(e.initiativeId)}` : ''}${e.componentId ? ` · ${a.of(e.componentId)}` : ''}`
			),
			...[...data.stories]
				.sort((x, y) => x.number - y.number)
				.map(
					(s) =>
						`${a.of(s.id)}${s.epicId ? ` (${a.of(s.epicId)})` : ''} : je veux ${oneLine(s.want, 140)}${s.personaId ? ` · ${a.of(s.personaId)}` : ''} · ${s.criteria.length} critère(s)`
				)
		]),
		section('SWOT et TOWS', [
			...byPosition(data.swot).map((s) => `${a.of(s.id)} ${s.quadrant} : ${s.text}`),
			...data.strategies.map(
				(s) =>
					`${s.kind} : ${s.text} (croise ${
						s.itemIds
							.map((i) => a.of(i))
							.filter(Boolean)
							.join(', ') || 'rien'
					})`
			)
		]),
		section(
			'Glossaire',
			data.terms.map((t) => `- ${t.term}`)
		),
		section(
			'Parcours',
			byPosition(data.journeys).map((j) => `- ${j.title}`)
		)
	];
	let text = parts.join('\n');
	if (options.withTasks) {
		const ordered = [...open].sort(
			(x, y) => (x.status === 'idea' ? 1 : 0) - (y.status === 'idea' ? 1 : 0) || x.number - y.number
		);
		const lines: string[] = [];
		for (const t of ordered) {
			const line = taskLine(t);
			if (tokensOf(text) + tokensOf(lines.join('\n') + line) > budget - 40) break;
			lines.push(line);
		}
		const left = ordered.length - lines.length;
		text += `\n${section('Tâches ouvertes', lines)}${left ? `(${left} autres tâches non listées)\n` : ''}`;
	}
	// The budget wins: the least useful parts were put last.
	const max = Math.floor(budget * 3.5);
	if (text.length > max) text = `${text.slice(0, max)}\n(contexte coupé)`;
	return { text, aliases: a.map };
}

/** The item a button targets, in full: the only place long texts are read. */
export function targetText(
	kind: TargetKind,
	targetId: string | null,
	data: ProjectData,
	aliases: Map<string, string>
): string {
	const alias = [...aliases].find(([, id]) => id === targetId)?.[0] ?? '';
	if (kind === 'task') {
		const t = data.tasks.find((x) => x.id === targetId);
		if (!t) return '';
		return `Tâche visée : ${alias} « ${t.title} » · ${t.kind} · ${t.status}\nNotes : ${t.notes ? t.notes.slice(0, 2000) : '(vides)'}\nChecklist : ${t.checklist.map((c) => c.text).join(' ; ') || '(vide)'}`;
	}
	if (kind === 'milestone') {
		const m = data.milestones.find((x) => x.id === targetId);
		if (!m) return '';
		const tasks = data.tasks.filter((t) => t.milestoneId === m.id);
		return `Étape visée : ${alias} « ${m.title} »${m.targetDate ? `, cible ${m.targetDate}` : ''}\nFini quand : ${m.doneWhen || '(vide)'}\nSes tâches : ${tasks.map((t) => `#${t.number} ${t.title} (${t.status})`).join(' ; ') || 'aucune'}`;
	}
	if (kind === 'epic') {
		const e = data.epics.find((x) => x.id === targetId);
		if (!e) return '';
		const stories = data.stories.filter((s) => s.epicId === e.id);
		return `Epic visée : ${alias} « ${e.title} »\n${e.description}\nSes stories : ${stories.map((s) => `US-${s.number} je veux ${s.want} (${s.criteria.map((c) => c.text).join(' / ') || 'sans critère'})`).join(' ; ') || 'aucune'}`;
	}
	if (kind === 'channel')
		return `Discussion visée, derniers messages :\n${(data.messages ?? [])
			.map((m) => `[${m.at.slice(0, 16).replace('T', ' ')}] ${m.author} : ${oneLine(m.body, 400)}`)
			.join('\n')}`;
	return '';
}

/** Turns the short names the model wrote in the link fields back into ids. */
export function resolveAliases(
	input: Record<string, unknown>,
	aliases: Map<string, string>
): Record<string, unknown> {
	const linkField = (key: string) => key === 'id' || key.endsWith('Id') || key === 'itemIds';
	const swap = (v: unknown) => (typeof v === 'string' ? (aliases.get(v.trim()) ?? v) : v);
	return Object.fromEntries(
		Object.entries(input).map(([key, value]) =>
			linkField(key) ? [key, Array.isArray(value) ? value.map(swap) : swap(value)] : [key, value]
		)
	);
}

/** Same project, same question, same answer: the cache key. A 53-bit hash, enough here. */
export function fingerprint(...parts: string[]): string {
	const text = parts.join('\u0000');
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 2654435761);
		h2 = Math.imul(h2 ^ c, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
