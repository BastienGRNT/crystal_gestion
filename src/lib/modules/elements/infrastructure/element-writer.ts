import { eq, sql } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { formatRef, prefixOf, type ElementKind } from '../../kernel/domain/element';
import { elementCounters, elements } from './schema';

export interface NewElement {
	projectId: string;
	kind: ElementKind;
	title: string;
	status?: string | null;
	createdBy: string;
}

/** Must run inside the module's transaction so an element never exists without its row. */
export async function insertElement(tx: Executor, input: NewElement) {
	const prefix = prefixOf(input.kind);
	const [counter] = await tx
		.insert(elementCounters)
		.values({ projectId: input.projectId, prefix, value: 1 })
		.onConflictDoUpdate({
			target: [elementCounters.projectId, elementCounters.prefix],
			set: { value: sql`${elementCounters.value} + 1` }
		})
		.returning();
	const [row] = await tx
		.insert(elements)
		.values({ ...input, prefix, number: counter.value })
		.returning({ id: elements.id });
	return { id: row.id, ref: formatRef(prefix, counter.value) };
}

export async function updateElement(
	tx: Executor,
	id: string,
	changes: { title?: string; status?: string | null }
) {
	await tx
		.update(elements)
		.set({ ...changes, updatedAt: new Date() })
		.where(eq(elements.id, id));
}

export async function deleteElement(tx: Executor, id: string) {
	await tx.delete(elements).where(eq(elements.id, id));
}

export const refColumn = sql<string>`${elements.prefix} || '-' || ${elements.number}`;
