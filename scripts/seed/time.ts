import type { DemoClient } from '../demo-client';
import type { Seed } from './context';
import type { Work } from './work';

type Block = [DemoClient, string, number, number, number, number];

/** Two weeks of work blocks (for the planning and its weekly recap) and everyone's availabilities. */
export async function seedTime(s: Seed, { tasks: t }: Work) {
	const { bastien, ana, leo, projectId, day } = s;
	const blocks: Block[] = [
		// client, task, day offset, from h, from min, duration min
		[bastien, t.product.id, -8, 19, 0, 120],
		[ana, t.stripe.id, -7, 20, 0, 90],
		[leo, t.texts.id, -6, 14, 30, 150],
		[bastien, t.font.id, -5, 21, 0, 60],
		[ana, t.webhook.id, -4, 19, 30, 120],
		[bastien, t.product.id, -1, 19, 0, 120],
		[ana, t.stripe.id, -2, 20, 0, 120],
		[leo, t.texts.id, -1, 14, 0, 105],
		[ana, t.mail.id, -1, 18, 0, 45],
		// Late session that runs past midnight.
		[bastien, t.font.id, -2, 22, 30, 120],
		[leo, t.import.id, -3, 10, 0, 60, 0]
	];
	for (const [client, taskId, offset, hour, minute, duration] of blocks) {
		const startedAt = day(offset, hour, minute);
		const endedAt = new Date(startedAt.getTime() + duration * 60_000);
		await client.command('time.createBlock', {
			projectId,
			taskId,
			startedAt: startedAt.toISOString(),
			endedAt: endedAt.toISOString()
		});
	}
	const slots: [DemoClient, number, number, number, string][] = [
		[bastien, 0, 19, 23, 'available'],
		[ana, 0, 20, 23, 'available'],
		[leo, 0, 14, 17, 'maybe'],
		[bastien, 1, 9, 12, 'available'],
		[ana, 1, 10, 12, 'available'],
		[leo, 2, 19, 22, 'available'],
		[bastien, 2, 20, 23, 'maybe'],
		[ana, 3, 18, 21, 'available']
	];
	for (const [client, offset, from, to, status] of slots)
		await client.command('availability.create', {
			startsAt: day(offset, from).toISOString(),
			endsAt: day(offset, to).toISOString(),
			status
		});
	// Léo works late on Saturdays: a slot crossing midnight.
	const saturday = (6 - new Date().getDay() + 7) % 7;
	await leo.command('availability.create', {
		startsAt: day(saturday, 21).toISOString(),
		endsAt: day(saturday + 1, 1).toISOString(),
		status: 'available'
	});
	// The live timer of the demo: Bastien is on the product page right now.
	await bastien.command('tasks.start', { projectId, id: t.product.id });
}
