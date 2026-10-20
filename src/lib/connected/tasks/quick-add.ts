import type { AppContext } from '$lib/client/context';
import type { TaskDraft } from '$lib/client/actions/tasks';
import { parseQuickEntry } from '$lib/modules/tasks/domain/quick-entry';
import { now } from '$lib/client/now.svelte';
import { framingTargets } from '../framing/attach';
import { componentOptions, reporters } from './components-of';

export const QUICK_HINT =
	'« bug: » au début pour un bug (« bug!: » s’il bloque) · @prénom pour la confier · +module · ^epic ou ^us-7 · ~nom de qui l’a signalé · demain ou 15/11 à la fin.';

/** Inline "add" fields read "@ana vendredi" the same way the full dialog does. */
export function quickAdd(
	{ app, actions }: AppContext,
	text: string,
	seed: Omit<TaskDraft, 'title'>,
	/** The seed's step only comes from the step on screen: a bug, being flow, takes none. */
	stepByDefault = false
) {
	const entry = parseQuickEntry(
		text,
		app.users.all,
		now.today,
		app.meId,
		componentOptions(app, seed.projectId),
		reporters(app, seed.projectId),
		framingTargets(app, seed.projectId)
	);
	const kind = seed.kind ?? entry.kind;
	return (
		actions.tasks.create({
			...seed,
			...(stepByDefault && kind === 'bug' && { milestoneId: null }),
			title: entry.title,
			kind,
			critical: entry.critical,
			reportedBy: entry.reportedBy,
			componentId: entry.componentId ?? seed.componentId ?? null,
			storyId: entry.storyId ?? seed.storyId ?? null,
			epicId: entry.epicId ?? seed.epicId ?? null,
			assigneeId: entry.assigneeId ?? seed.assigneeId ?? null,
			dueDate: entry.dueDate ?? seed.dueDate ?? null
		}) !== null
	);
}
