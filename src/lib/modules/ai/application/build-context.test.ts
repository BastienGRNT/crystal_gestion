import { describe, expect, it } from 'vitest';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { Task } from '$lib/modules/tasks/domain/task';
import { makeBuildProjectContext } from './build-context';

const element = (id: string, ref: string) => ({ id, ref }) as ElementSummary;

describe('project context', () => {
	it('expresses structural links and free references with readable refs', async () => {
		const build = makeBuildProjectContext({
			project: async () => null,
			features: async () => [],
			tasks: async () => [
				{ ref: 'T-1', title: 'Payer', status: 'todo', featureId: 'f', dueDate: null } as Task
			],
			journal: async () => [],
			elements: async () => [element('f', 'F-1'), element('t', 'T-1'), element('m', 'M-3')],
			references: async () => [{ sourceId: 'm', targetId: 't' }],
			notes: async () => []
		});
		const context = await build('p');
		expect(context.tasks[0].feature).toBe('F-1');
		expect(context.references).toEqual([{ from: 'M-3', to: 'T-1' }]);
	});
});
