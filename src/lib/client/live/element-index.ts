import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { LiveCollection } from './collection.svelte';

type Reference = { sourceId: string; targetId: string };

const isElement = (
	data: unknown
): data is Omit<ElementSummary, 'status' | 'createdBy'> & Record<string, unknown> =>
	typeof data === 'object' && data !== null && 'ref' in data && 'kind' in data && 'title' in data;

/** Any DTO extending ElementBase feeds the reference index, whatever its module. */
export function toSummary(
	data: unknown,
	index: LiveCollection<ElementSummary>
): ElementSummary | null {
	if (!isElement(data)) return null;
	const known = index.get(data.id);
	const author = data.createdBy ?? data.authorId ?? known?.createdBy ?? null;
	return {
		id: data.id,
		ref: data.ref,
		kind: data.kind,
		title: data.title,
		status: known?.status ?? null,
		createdBy: typeof author === 'string' ? author : null,
		createdAt:
			typeof data.createdAt === 'string'
				? data.createdAt
				: (known?.createdAt ?? new Date().toISOString())
	};
}

export const withSource = (
	references: Reference[],
	{ sourceId, targetIds }: { sourceId: string; targetIds: string[] }
) => [
	...references.filter((reference) => reference.sourceId !== sourceId),
	...targetIds.map((targetId) => ({ sourceId, targetId }))
];

export const withoutElement = (references: Reference[], id: string) =>
	references.filter((reference) => reference.sourceId !== id && reference.targetId !== id);
