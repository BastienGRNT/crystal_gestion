import type { Actions } from '$lib/client/actions';
import type { CreateSeed } from '$lib/client/create-kinds';
import type { QuickEntry } from '$lib/client/views/quick-entry';
import type { Moscow } from '$lib/modules/features/domain/feature';

/** Everything the creation forms edit; each form reads only its fields. */
export interface CreateDraft {
	title: string;
	/** Details of a task, purpose of a feat, note of an idea. */
	body: string;
	isFix: boolean;
	featureId: string | null;
	assigneeIds: string[];
	reviewerId: string | null;
	dueDate: string | null;
	status: 'icebox' | 'todo';
	priority: Moscow;
	ownerId: string | null;
	/** A feat's first tasks. */
	lines: string[];
}

export const emptyDraft = (seed: CreateSeed, meId: string, isFix = false): CreateDraft => ({
	title: seed.title ?? '',
	body: '',
	isFix,
	featureId: seed.featureId ?? null,
	assigneeIds: seed.assigneeIds ?? [meId],
	reviewerId: null,
	dueDate: seed.dueDate ?? null,
	status: seed.status ?? 'todo',
	priority: 'should',
	ownerId: meId,
	lines: []
});

/** What the typed title says wins over the fields: « @ana » replaces the default person. */
export const resolveDraft = (d: CreateDraft, parsed: QuickEntry) => ({
	title: parsed.title,
	featureId: parsed.featureId ?? d.featureId,
	assigneeIds: parsed.assigneeIds.length ? parsed.assigneeIds : d.assigneeIds,
	dueDate: parsed.dueDate ?? d.dueDate
});

export async function submitTask(d: CreateDraft, parsed: QuickEntry, actions: Actions) {
	const resolved = resolveDraft(d, parsed);
	const extra = { isFix: d.isFix, reviewerId: d.reviewerId, status: d.status };
	return actions.tasks.create({ ...resolved, ...extra, description: d.body.trim() });
}

/** The feat, then its tasks in the order they were typed. */
export async function submitFeat(d: CreateDraft, actions: Actions) {
	const { title, priority, ownerId } = d;
	const feature = await actions.features.create({ title: title.trim(), priority, ownerId });
	if (!feature) return undefined;
	if (d.body.trim()) actions.features.update(feature.id, { description: d.body.trim() });
	for (const line of d.lines)
		await actions.tasks.create({ title: line, featureId: feature.id, assigneeIds: [] });
	return feature;
}
