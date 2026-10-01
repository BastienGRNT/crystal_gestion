import type { Actions } from '$lib/client/actions';
import type { CreateKind, CreateSeed } from '$lib/client/create-kinds';
import type { QuickEntry } from '$lib/client/views/quick-entry';
import { toCreateInput } from '$lib/client/views/journal-draft';
import { toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Moscow } from '$lib/modules/features/domain/feature';
import type { TaskStatus } from '$lib/modules/tasks/domain/task';

/** What « Nouveau » edits besides the typed line; each kind reads only the fields it shows. */
export interface CreateDraft {
	text: string;
	/** Second field: details, the reason of a decision, or a feature's tasks (one per line). */
	body: string;
	featureId: string | null;
	assigneeIds: string[];
	dueDate: string | null;
	status: TaskStatus;
	priority: Moscow;
	ownerId: string;
}

export const emptyDraft = (seed: CreateSeed, meId: string): CreateDraft => ({
	text: seed.title ?? '',
	body: '',
	featureId: seed.featureId ?? null,
	assigneeIds: [meId],
	dueDate: seed.dueDate ?? null,
	status: seed.status ?? 'todo',
	priority: 'should',
	ownerId: meId
});

/** The typed line wins over the buttons: « @ana » replaces the default assignee. */
export const resolveDraft = (d: CreateDraft, parsed: QuickEntry) => ({
	title: parsed.title,
	featureId: parsed.featureId ?? d.featureId,
	assigneeIds: parsed.assigneeIds.length ? parsed.assigneeIds : d.assigneeIds,
	dueDate: parsed.dueDate ?? d.dueDate
});

export const CREATED_LABEL: Record<CreateKind, string> = {
	task: 'Tâche créée',
	bug: 'Bug ajouté',
	feature: 'Feature créée',
	idea: 'Idée notée',
	decision: 'Décision gardée dans le journal'
};

const lines = (text: string) =>
	text
		.split('\n')
		.map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
		.filter(Boolean);

/** Creates the element (and a feature's first tasks); returns its ref, or nothing if refused. */
export async function submitDraft(
	kind: CreateKind,
	d: CreateDraft,
	parsed: QuickEntry,
	actions: Actions,
	meId: string
) {
	const { title, featureId, assigneeIds, dueDate } = resolveDraft(d, parsed);
	if (kind === 'task' || kind === 'bug') {
		const isFix = kind === 'bug';
		const input = { title, featureId, assigneeIds, dueDate, isFix, status: d.status };
		return (await actions.tasks.create({ ...input, description: d.body.trim() }))?.ref;
	}
	if (kind === 'feature') {
		const feature = await actions.features.create({
			...{ title, priority: d.priority, ownerId: d.ownerId }
		});
		if (feature)
			for (const task of lines(d.body))
				await actions.tasks.create({ title: task, featureId: feature.id, assigneeIds: [] });
		return feature?.ref;
	}
	if (kind === 'idea')
		return (await actions.ideas.create({ title, featureId, note: d.body.trim() }))?.ref;
	const entry = toCreateInput({
		...{ kind, title, featureId: featureId ?? '', rationale: d.body },
		...{ decidedBy: [meId], decidedOn: toDateKey(new Date()) },
		...{ problem: '', cause: '', solution: '' }
	});
	return (await actions.journal.create(entry))?.ref;
}
