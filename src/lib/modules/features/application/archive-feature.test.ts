import { describe, expect, it, vi } from 'vitest';
import type { Feature } from '../domain/feature';
import { makeArchiveFeature } from './archive-feature';

const feature: Feature = {
	...{ id: 'f1', ref: 'F-1', kind: 'feature', projectId: 'p', title: 'Paiement' },
	...{ description: '', priority: 'must', ownerId: null, doneCriteria: '' },
	...{ createdAt: '2026-01-01T00:00:00.000Z', archivedAt: null }
};
const now = new Date('2026-03-01T10:00:00Z');

const setup = () => {
	const deps = {
		features: {
			find: vi.fn(async () => feature),
			setArchived: vi.fn(async (_p: string, _id: string, at: Date | null) => ({
				...feature,
				archivedAt: at?.toISOString() ?? null
			})),
			...{ create: vi.fn(), update: vi.fn(), delete: vi.fn(), list: vi.fn() }
		},
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		activity: { record: vi.fn() },
		clock: { now: () => now }
	};
	return { deps, archive: makeArchiveFeature(deps) };
};
const actor = { id: 'u', name: 'U' };

describe('archive feature', () => {
	it('stamps the feature, broadcasts it and logs « archived »', async () => {
		const { deps, archive } = setup();
		const result = await archive(actor, { projectId: 'p', id: 'f1', archived: true });
		expect(result.archivedAt).toBe(now.toISOString());
		expect(deps.feed.upserted).toHaveBeenCalledWith('feature', 'p', result);
		expect(deps.activity.record).toHaveBeenCalledWith(
			expect.objectContaining({ verb: 'archived' })
		);
	});

	it('brings an archived feature back', async () => {
		const { deps, archive } = setup();
		await archive(actor, { projectId: 'p', id: 'f1', archived: false });
		expect(deps.features.setArchived).toHaveBeenCalledWith('p', 'f1', null);
	});
});
