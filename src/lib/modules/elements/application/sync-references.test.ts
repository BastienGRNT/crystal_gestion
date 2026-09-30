import { describe, expect, it, vi } from 'vitest';
import { makeReferenceSync } from './sync-references';

const setup = () => {
	const references = { list: vi.fn(), replaceForSource: vi.fn() };
	const elements = {
		list: vi.fn(),
		findByRef: vi.fn(),
		idsForRefs: vi.fn(async () => ['target', 'self'])
	};
	const feed = { upserted: vi.fn(), deleted: vi.fn() };
	return { references, elements, feed, sync: makeReferenceSync({ references, elements, feed }) };
};

describe('reference sync', () => {
	it('stores references found in texts, never to itself', async () => {
		const { sync, references, elements } = setup();
		await sync.sync('p', 'self', ['voir #T-1', 'et #F-2']);
		expect(elements.idsForRefs).toHaveBeenCalledWith('p', ['T-1', 'F-2']);
		expect(references.replaceForSource).toHaveBeenCalledWith('p', 'self', ['target']);
	});

	it('clears references when the text has none', async () => {
		const { sync, references, elements, feed } = setup();
		await sync.sync('p', 'self', ['rien']);
		expect(elements.idsForRefs).not.toHaveBeenCalled();
		expect(references.replaceForSource).toHaveBeenCalledWith('p', 'self', []);
		expect(feed.upserted).toHaveBeenCalledWith('reference', 'p', {
			sourceId: 'self',
			targetIds: []
		});
	});
});
