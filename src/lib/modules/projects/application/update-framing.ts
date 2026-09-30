import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Framing } from '../domain/project';
import type { ProjectRepository } from './ports';

export const makeUpdateFraming =
	(deps: { projects: ProjectRepository; feed: ChangeFeed }) =>
	async (projectId: string, changes: Partial<Framing>) => {
		const project = await deps.projects.update(projectId, changes);
		deps.feed.upserted('project', projectId, project);
		return project;
	};
