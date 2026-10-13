import type { AppContext } from '$lib/client/context';
import type { TaskDraft } from '$lib/client/actions/tasks';
import { parseQuickEntry } from '$lib/modules/tasks/domain/quick-entry';
import { now } from '$lib/client/now.svelte';

export const QUICK_HINT =
	'Astuce : « @prénom » pour la confier, « demain » ou « 15/11 » à la fin pour l’échéance.';

/** Inline "add" fields read "@ana vendredi" the same way the full dialog does. */
export function quickAdd(
	{ app, actions }: AppContext,
	text: string,
	seed: Omit<TaskDraft, 'title'>
) {
	const entry = parseQuickEntry(text, app.users.all, now.today, app.meId);
	return (
		actions.tasks.create({
			...seed,
			title: entry.title,
			assigneeId: entry.assigneeId ?? seed.assigneeId ?? null,
			dueDate: entry.dueDate ?? seed.dueDate ?? null
		}) !== null
	);
}
