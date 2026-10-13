import { projectAccess } from './application/access';
import { createProject, setArchived, updateProject } from './application/manage-projects';
import type { ProjectDeps } from './application/ports';
import {
	createInvitation,
	inspectInvitation,
	joinWithInvitation,
	removeMember
} from './application/team';

export function createProjects(deps: ProjectDeps) {
	return {
		access: projectAccess(deps.members),
		/** The projects someone belongs to, with their teams. */
		async of(userId: string) {
			const ids = await deps.members.projectIdsOf(userId);
			const [projects, members] = await Promise.all([
				deps.projects.listByIds(ids),
				deps.members.ofProjects(ids)
			]);
			return { projects, members };
		},
		projectIdsOf: (userId: string) => deps.members.projectIdsOf(userId),
		create: createProject(deps),
		update: updateProject(deps),
		setArchived: setArchived(deps),
		invite: createInvitation(deps),
		inspectInvitation: inspectInvitation(deps),
		join: joinWithInvitation(deps),
		removeMember: removeMember(deps)
	};
}

export type Projects = ReturnType<typeof createProjects>;
