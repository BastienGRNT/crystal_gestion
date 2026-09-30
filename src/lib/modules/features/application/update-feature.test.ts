import { describe, expect, it, vi } from 'vitest';
import type { Feature } from '../domain/feature';
import { makeUpdateFeature } from './update-feature';

const feature: Feature = {
	id: 'f1',
	ref: 'F-1',
	kind: 'feature',
	projectId: 'p',
	title: 'Paiement',
	description: '',
	priority: 'should',
	ownerId: null,
	doneCriteria: '',
	createdAt: '2026-01-01T00:00:00.000Z'
};

const setup = (after: Partial<Feature>) => {
	const deps = {
		features: {
			find: vi.fn(async () => feature),
			update: vi.fn(async () => ({ ...feature, ...after })),
			create: vi.fn(),
			delete: vi.fn(),
			list: vi.fn()
		},
		scopeLog: { record: vi.fn() },
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		activity: { record: vi.fn() },
		references: { sync: vi.fn() }
	};
	return { deps, update: makeUpdateFeature(deps) };
};
const actor = { id: 'u', name: 'U' };

describe('update feature', () => {
	it('logs a scope change when the MoSCoW priority changes', async () => {
		const { deps, update } = setup({ priority: 'wont' });
		await update(actor, { projectId: 'p', id: 'f1', changes: { priority: 'wont' } });
		expect(deps.scopeLog.record).toHaveBeenCalledWith(
			actor,
			expect.objectContaining({ priority: 'wont' }),
			{
				change: 'reprioritized',
				from: 'should',
				to: 'wont'
			}
		);
	});

	it('does not touch the journal for a simple rename', async () => {
		const { deps, update } = setup({ title: 'Paiements' });
		await update(actor, { projectId: 'p', id: 'f1', changes: { title: 'Paiements' } });
		expect(deps.scopeLog.record).not.toHaveBeenCalled();
		expect(deps.references.sync).not.toHaveBeenCalled();
	});
});
