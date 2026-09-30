import { describe, expect, it } from 'vitest';
import type { Task } from '$lib/modules/tasks/domain/task';
import { dropPosition } from './kanban';

const task = (id: string, position: number) => ({ id, position }) as Task;
const column = [task('a', 1), task('b', 2), task('c', 3)];

describe('dropPosition', () => {
	it('places a card coming from another column between its neighbours', () => {
		expect(dropPosition(column, 'x', 1)).toBe(1.5);
		expect(dropPosition(column, 'x', 3)).toBe(3 + 1024);
	});

	it('accounts for the card still being in its own column', () => {
		expect(dropPosition(column, 'a', 3)).toBe(3 + 1024);
		expect(dropPosition(column, 'c', 0)).toBe(1 - 1024);
		expect(dropPosition(column, 'a', 2)).toBe(2.5);
	});
});
