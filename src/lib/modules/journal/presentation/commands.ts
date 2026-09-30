import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { dateKey, id, projectScoped, text, title } from '$lib/server/commands/schemas';
import type { JournalModule } from '..';

const details = z
	.object({
		rationale: text(),
		decidedBy: z.array(id),
		decidedOn: dateKey.nullable(),
		problem: text(),
		cause: text(),
		solution: text()
	})
	.partial();

const fields = z.object({ title, featureId: id.nullable(), details });

export const journalCommands = (journal: JournalModule) => ({
	'journal.create': defineCommand(
		projectScoped.extend(fields.shape).extend({ kind: z.enum(['decision', 'fix']) }),
		(actor, input) => journal.create(actor, input)
	),
	'journal.update': defineCommand(
		projectScoped.extend({ id, changes: fields.partial() }),
		(actor, input) => journal.update(actor, input)
	),
	'journal.delete': defineCommand(projectScoped.extend({ id }), (actor, input) =>
		journal.remove(actor, input)
	)
});
