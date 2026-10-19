import { invalid, notFound } from '../../kernel/domain/errors';
import type { Subject } from '../../kernel/domain/subject';
import {
	changelogOf,
	shippable,
	validReleaseName,
	validReleaseNotes,
	type Release
} from '../domain/release';
import type { RoadmapDeps } from './ports';

export interface ShipInput {
	id: string;
	projectId: string;
	name: string;
	taskIds: string[];
	notes?: string;
}

const subjectOf = (release: Release): Subject => ({
	kind: 'release',
	id: release.id,
	title: release.name,
	projectId: release.projectId
});

async function existing(deps: RoadmapDeps, id: string, actorId: string) {
	const release = await deps.releases.get(id);
	if (!release) throw notFound('Version');
	await deps.access.assertMember(release.projectId, actorId);
	return release;
}

/**
 * "C'est en prod": the chosen tasks (done, of this project, not shipped yet) get the version,
 * and the changelog is written from them, once, as they are now.
 */
export const shipRelease = (deps: RoadmapDeps) => async (input: ShipInput, actorId: string) => {
	await deps.access.assertMember(input.projectId, actorId);
	if (!input.taskIds.length) throw invalid('Rien à mettre en prod : coche au moins une tâche.');
	const tasks = await Promise.all(input.taskIds.map((id) => deps.tasks.get(id, actorId)));
	for (const task of tasks)
		if (task.projectId !== input.projectId || !shippable(task))
			throw invalid(`#${task.number} n’est pas prête à partir (pas terminée, ou déjà en prod).`);
	const names = await deps.tasks.componentNames(input.projectId);
	const name = validReleaseName(input.name);
	const now = deps.clock.now().toISOString();
	const release: Release = {
		id: input.id,
		projectId: input.projectId,
		name,
		shippedAt: now,
		changelog: changelogOf(name, tasks, (id) => (id ? (names.get(id) ?? null) : null)),
		notes: validReleaseNotes(input.notes ?? ''),
		createdBy: actorId,
		createdAt: now
	};
	await deps.releases.put(release);
	deps.releaseFeed.saved(release);
	for (const task of tasks) await deps.tasks.move(task.id, { releaseId: release.id }, actorId);
	await deps.activity.record({ actorId, verb: 'release.shipped', subject: subjectOf(release) });
	return release;
};

export const updateRelease =
	(deps: RoadmapDeps) =>
	async (id: string, patch: { name?: string; notes?: string }, actorId: string) => {
		const release = await existing(deps, id, actorId);
		const next: Release = {
			...release,
			...(patch.name !== undefined && { name: validReleaseName(patch.name) }),
			...(patch.notes !== undefined && { notes: validReleaseNotes(patch.notes) })
		};
		await deps.releases.put(next);
		deps.releaseFeed.saved(next);
		return next;
	};

/** Undoing a version (shipped by mistake): its tasks are ready to ship again. */
export const deleteRelease = (deps: RoadmapDeps) => async (id: string, actorId: string) => {
	const release = await existing(deps, id, actorId);
	for (const task of await deps.tasks.ofRelease(id))
		await deps.tasks.move(task.id, { releaseId: null }, actorId);
	await deps.releases.delete(id);
	deps.releaseFeed.removed(release);
};
