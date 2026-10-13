/** Test doubles shared by the use case tests of every module. */
import type { Access, ActivityLog, ChangeFeed, Clock, Notifier } from './application/ports';
import { forbidden } from './domain/errors';
import type { ActivityInput, NotificationInput } from './domain/subject';

export class FixedClock implements Clock {
	constructor(private current = new Date('2026-10-13T10:00:00Z')) {}
	now() {
		return new Date(this.current);
	}
	advance(ms: number) {
		this.current = new Date(this.current.getTime() + ms);
	}
}

export class RecordingFeed<Item extends { id?: string }> implements ChangeFeed<Item> {
	saves: Item[] = [];
	removals: string[] = [];
	saved(item: Item) {
		this.saves.push(item);
	}
	removed(item: Item) {
		this.removals.push(item.id ?? '');
	}
	get last() {
		return this.saves.at(-1);
	}
}

export class RecordingActivity implements ActivityLog {
	entries: ActivityInput[] = [];
	async record(entry: ActivityInput) {
		this.entries.push(entry);
	}
	get verbs() {
		return this.entries.map((entry) => entry.verb);
	}
}

export class RecordingNotifier implements Notifier {
	sent: NotificationInput[] = [];
	async notify(notification: NotificationInput) {
		this.sent.push(notification);
	}
}

let counter = 0;
/** Deterministic, valid-looking UUIDs for tests. */
export const testId = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;

/** A map-backed store most fake repositories are built on. */
export class MemoryTable<Row extends { id: string }> {
	rows = new Map<string, Row>();
	get(id: string) {
		return this.rows.get(id) ?? null;
	}
	put(row: Row) {
		this.rows.set(row.id, structuredClone(row));
	}
	delete(id: string) {
		this.rows.delete(id);
	}
	all() {
		return [...this.rows.values()];
	}
}

/** Membership for tests: `members` lists who belongs to each project. */
export class FakeAccess implements Access {
	constructor(private projects: Record<string, string[]>) {}
	async isMember(projectId: string, userId: string) {
		return this.projects[projectId]?.includes(userId) ?? false;
	}
	async assertMember(projectId: string, userId: string) {
		if (!(await this.isMember(projectId, userId)))
			throw forbidden('Tu ne fais pas partie de ce projet.');
	}
	async members(projectId: string) {
		return this.projects[projectId] ?? [];
	}
}
