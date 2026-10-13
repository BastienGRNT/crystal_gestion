import { describe, expect, it } from 'vitest';
import { parseDay, parseQuickEntry } from './quick-entry';

const people = [
	{ id: 'u-bastien', name: 'Bastien Grenot' },
	{ id: 'u-ana', name: 'Ana Lefèvre' }
];
// Tuesday
const today = '2026-10-13';

describe('quick entry', () => {
	it('reads who and when from the end of the title', () => {
		expect(parseQuickEntry('Corriger le login @ana demain', people, today)).toEqual({
			title: 'Corriger le login',
			assigneeId: 'u-ana',
			dueDate: '2026-10-14'
		});
	});

	it('leaves a date in the middle of the title alone', () => {
		const entry = parseQuickEntry('Préparer demain la démo', people, today);
		expect(entry).toMatchObject({ title: 'Préparer demain la démo', dueDate: null });
	});

	it('ignores unknown people and keeps them in the title', () => {
		expect(parseQuickEntry('Appeler @paul', people, today).title).toBe('Appeler @paul');
	});

	it('understands @moi', () => {
		expect(parseQuickEntry('Relire @moi', people, today, 'u-bastien').assigneeId).toBe('u-bastien');
	});

	it('never empties the title', () => {
		expect(parseQuickEntry('demain', people, today)).toMatchObject({
			title: 'demain',
			dueDate: null
		});
	});
});

describe('days', () => {
	it('knows relative words and the next weekday', () => {
		expect(parseDay("aujourd'hui", today)).toBe(today);
		expect(parseDay('Après-demain', today)).toBe('2026-10-15');
		expect(parseDay('vendredi', today)).toBe('2026-10-16');
		expect(parseDay('mardi', today)).toBe('2026-10-20');
	});

	it('reads day/month, rolling to next year when already past', () => {
		expect(parseDay('15/11', today)).toBe('2026-11-15');
		expect(parseDay('3/1', today)).toBe('2027-01-03');
		expect(parseDay('31/02', today)).toBeNull();
		expect(parseDay('12/12/2027', today)).toBe('2027-12-12');
	});
});
