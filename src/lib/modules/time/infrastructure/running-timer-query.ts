import { and, eq, isNull } from 'drizzle-orm';
import { formatRef, prefixOf } from '$lib/modules/kernel/domain/element';
import { elements } from '$lib/modules/elements/infrastructure/schema';
import { projects } from '$lib/modules/projects/infrastructure/schema';
import type { Executor } from '$lib/server/db/types';
import type { RunningTimerQuery } from '../application/ports';
import { timeEntries } from './schema';
import { toEntry } from './time-entry-repository';

export const drizzleRunningTimerQuery = (db: Executor): RunningTimerQuery => ({
	async forUser(userId) {
		const [row] = await db
			.select({
				entry: timeEntries,
				number: elements.number,
				title: elements.title,
				project: projects
			})
			.from(timeEntries)
			.innerJoin(elements, eq(elements.id, timeEntries.taskId))
			.innerJoin(projects, eq(projects.id, timeEntries.projectId))
			.where(and(eq(timeEntries.userId, userId), isNull(timeEntries.endedAt)))
			.limit(1);
		if (!row) return null;
		return {
			entry: toEntry(row.entry),
			task: { ref: formatRef(prefixOf('task'), row.number), title: row.title },
			project: { slug: row.project.slug, name: row.project.name }
		};
	}
});
