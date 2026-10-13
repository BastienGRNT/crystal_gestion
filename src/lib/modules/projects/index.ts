import { createProject, setArchived, updateProject } from './application/manage-projects';
import type { ProjectDeps } from './application/ports';

export function createProjects(deps: ProjectDeps) {
	return {
		list: () => deps.projects.list(),
		get: (id: string) => deps.projects.get(id),
		create: createProject(deps),
		update: updateProject(deps),
		setArchived: setArchived(deps)
	};
}

export type Projects = ReturnType<typeof createProjects>;
