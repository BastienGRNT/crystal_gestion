import { daysBetween, type DateKey } from '../../kernel/domain/dates';

export type DueState = 'overdue' | 'today' | 'soon' | 'later';

/** "Soon" is the next two days: close enough to deserve a look, not to cry wolf. */
export function dueState(dueDate: DateKey | null, today: DateKey): DueState | null {
	if (!dueDate) return null;
	const days = daysBetween(today, dueDate);
	if (days < 0) return 'overdue';
	if (days === 0) return 'today';
	return days <= 2 ? 'soon' : 'later';
}
