import { describe, expect, it, vi } from 'vitest';
import { makeElementCrud } from './element-crud';

const idea = {
	id: 'i1',
	ref: 'I-1',
	kind: 'idea' as const,
	title: 'Mode hors ligne',
	projectId: 'p',
	note: 'voir #T-2'
};
const actor = { id: 'u', name: 'U' };

const setup = (found: typeof idea | null = idea) => {
	const deps = {
		entity: 'idea' as const,
		store: {
			create: vi.fn(async () => idea),
			update: vi.fn(async () => idea),
			find: vi.fn(async () => found),
			delete: vi.fn(),
			list: vi.fn()
		},
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		activity: { record: vi.fn() },
		references: { sync: vi.fn() },
		textsOf: (element: typeof idea) => [element.note]
	};
	return { deps, crud: makeElementCrud<typeof idea, { title: string; note?: string }>(deps) };
};

describe('element crud', () => {
	it('broadcasts, indexes references and logs a creation', async () => {
		const { deps, crud } = setup();
		await crud.create(actor, { projectId: 'p', title: 'Mode hors ligne' });
		expect(deps.store.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'u' }));
		expect(deps.feed.upserted).toHaveBeenCalledWith('idea', 'p', idea);
		expect(deps.references.sync).toHaveBeenCalledWith('p', 'i1', ['voir #T-2']);
		expect(deps.activity.record).toHaveBeenCalledWith(expect.objectContaining({ verb: 'created' }));
	});

	it('refuses to update an element of another project', async () => {
		const { crud } = setup(null);
		await expect(crud.update(actor, { projectId: 'x', id: 'i1', changes: {} })).rejects.toThrow(
			'introuvable'
		);
	});

	it('broadcasts deletions', async () => {
		const { deps, crud } = setup();
		await crud.remove(actor, { projectId: 'p', id: 'i1' });
		expect(deps.feed.deleted).toHaveBeenCalledWith('idea', 'p', 'i1');
	});
});
