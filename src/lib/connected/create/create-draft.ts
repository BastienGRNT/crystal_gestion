import type { Actions } from '$lib/client/actions';
import type { CreateKind, CreateSeed } from '$lib/client/create-kinds';
import { toCreateInput } from '$lib/client/views/journal-draft';
import { toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Moscow } from '$lib/modules/features/domain/feature';

/** Everything the « Créer » dialog edits; each kind reads only the fields it shows. */
export interface CreateDraft {
	title: string;
	featureId: string | null;
	assigneeIds: string[];
	dueDate: string | null;
	priority: Moscow;
	ownerId: string;
	rationale: string;
	problem: string;
	cause: string;
	solution: string;
}

export const emptyDraft = (seed: CreateSeed, meId: string): CreateDraft => ({
	title: seed.title ?? '',
	featureId: seed.featureId ?? null,
	assigneeIds: [meId],
	dueDate: null,
	priority: 'should',
	ownerId: meId,
	rationale: '',
	problem: '',
	cause: '',
	solution: ''
});

export const CREATED_LABEL: Record<CreateKind, string> = {
	task: 'Tâche créée',
	bug: 'Bug ajouté',
	feature: 'Feature créée',
	idea: 'Idée notée',
	decision: 'Ajouté au journal',
	fix: 'Ajouté au journal'
};

/** Creates the element and returns its ref, or nothing when the server refused. */
export async function submitDraft(
	kind: CreateKind,
	d: CreateDraft,
	actions: Actions,
	meId: string
) {
	const title = d.title.trim();
	if (kind === 'task' || kind === 'bug') {
		const { featureId, assigneeIds, dueDate } = d;
		return (
			await actions.tasks.create({ title, featureId, assigneeIds, dueDate, isFix: kind === 'bug' })
		)?.ref;
	}
	if (kind === 'feature')
		return (await actions.features.create({ title, priority: d.priority, ownerId: d.ownerId }))
			?.ref;
	if (kind === 'idea') return (await actions.ideas.create({ title, featureId: d.featureId }))?.ref;
	const entry = toCreateInput({
		...{ kind, title, featureId: d.featureId ?? '', rationale: d.rationale },
		...{ decidedBy: [meId], decidedOn: toDateKey(new Date()) },
		...{ problem: d.problem, cause: d.cause, solution: d.solution }
	});
	return (await actions.journal.create(entry))?.ref;
}
