import type { AppState } from '$lib/client/state/app.svelte';
import type { Framed } from '$lib/client/views/framing';
import { briefSections, BRIEF_HEADINGS, type Project } from '$lib/modules/projects/domain/project';
import { SWOT_LABELS, STAKEHOLDER_ROLE_LABELS, STRATEGY_LABELS } from '$lib/client/labels';

const own = <T extends { projectId: string }>(items: T[], projectId: string) =>
	items.filter((i) => i.projectId === projectId);

/** Everything framed in a project, from the live collections. */
export function framedOf(app: AppState, project: Project): Framed {
	const id = project.id;
	return {
		project,
		initiatives: own(app.initiatives.all, id),
		epics: own(app.epics.all, id),
		stories: own(app.stories.all, id),
		stakeholders: own(app.stakeholders.all, id),
		journeys: own(app.journeys.all, id),
		terms: own(app.terms.all, id),
		swot: own(app.swot.all, id),
		strategies: own(app.strategies.all, id),
		metrics: own(app.metrics.all, id),
		components: own(app.components.all, id),
		milestones: own(app.milestones.all, id),
		tasks: own(app.tasks.all, id)
	};
}

/** The framing note as Markdown: QQOQCCP, stakeholders, numbers, bets, SWOT and TOWS. */
export function framingNoteMarkdown(app: AppState, f: Framed): string {
	const sections = briefSections(f.project.brief);
	const bets = own(app.hypotheses.all, f.project.id).filter((h) => h.verdict === 'open');
	const lines = [
		`# Note de cadrage · ${f.project.name}\n`,
		...BRIEF_HEADINGS.map((h) => `## ${h}\n\n${sections[h] || '_À écrire._'}\n`),
		`## Parties prenantes\n\n${
			f.stakeholders
				.map(
					(s) =>
						`- **${s.name}**${s.organization ? ` (${s.organization})` : ''} · ${STAKEHOLDER_ROLE_LABELS[s.role].toLowerCase()}${s.expects ? ` · attend : ${s.expects}` : ''}`
				)
				.join('\n') || '_À écrire._'
		}\n`,
		`## Indicateurs de succès\n\n${
			f.metrics
				.filter((m) => !m.archivedAt)
				.map((m) => `- ${m.name}${m.target !== null ? ` : cible ${m.target} ${m.unit}` : ''}`)
				.join('\n') || '_À écrire._'
		}\n`,
		`## Paris à vérifier\n\n${bets.map((h) => `- ${h.text}`).join('\n') || '_Aucun._'}\n`,
		`## SWOT\n\n${(['S', 'W', 'O', 'T'] as const)
			.map(
				(q) =>
					`### ${SWOT_LABELS[q].label}\n\n${
						f.swot
							.filter((i) => i.quadrant === q)
							.map((i) => `- ${i.text}`)
							.join('\n') || '_—_'
					}`
			)
			.join('\n\n')}\n`,
		`## TOWS\n\n${
			f.strategies
				.map((s) => `- **${s.kind} · ${STRATEGY_LABELS[s.kind].label}** : ${s.text}`)
				.join('\n') || '_—_'
		}\n`
	];
	return lines.join('\n');
}
