import { notFound } from '../../kernel/domain/errors';
import { memberId } from '../domain/membership';
import {
	uniqueSlug,
	validDeadline,
	validDescription,
	validProjectColor,
	validProjectName,
	validWeekGoal,
	type Project
} from '../domain/project';
import { projectAccess } from './access';
import type { ProjectDeps } from './ports';

export interface NewProject {
	id: string;
	name: string;
	description?: string;
	color?: number;
	deadline?: string | null;
}

export type ProjectPatch = Partial<
	Pick<Project, 'name' | 'description' | 'color' | 'deadline' | 'weekGoal'>
>;

/** The creator becomes the project's first owner. */
export const createProject = (deps: ProjectDeps) => async (input: NewProject, actorId: string) => {
	const name = validProjectName(input.name);
	const now = deps.clock.now().toISOString();
	const project: Project = {
		id: input.id,
		slug: uniqueSlug(name, await deps.projects.slugs()),
		name,
		description: validDescription(input.description ?? ''),
		color: validProjectColor(input.color ?? 0),
		deadline: validDeadline(input.deadline ?? null),
		weekGoal: '',
		archivedAt: null,
		createdBy: actorId,
		createdAt: now
	};
	await deps.projects.insert(project);
	const owner = {
		id: memberId(project.id, actorId),
		projectId: project.id,
		userId: actorId,
		role: 'owner' as const,
		joinedAt: now
	};
	await deps.members.add(owner);
	deps.feed.saved(project);
	deps.memberFeed.saved(owner);
	await deps.hooks.created(project, actorId);
	await deps.activity.record({
		actorId,
		verb: 'project.created',
		subject: { kind: 'project', id: project.id, title: project.name, projectId: project.id }
	});
	return project;
};

async function change(
	deps: ProjectDeps,
	id: string,
	actorId: string,
	edit: (p: Project) => Project
) {
	await projectAccess(deps.members).assertMember(id, actorId);
	const current = await deps.projects.get(id);
	if (!current) throw notFound('Projet');
	const project = edit(current);
	await deps.projects.save(project);
	deps.feed.saved(project);
	return project;
}

export const updateProject =
	(deps: ProjectDeps) => (id: string, patch: ProjectPatch, actorId: string) =>
		change(deps, id, actorId, (project) => ({
			...project,
			...(patch.name !== undefined && { name: validProjectName(patch.name) }),
			...(patch.description !== undefined && { description: validDescription(patch.description) }),
			...(patch.color !== undefined && { color: validProjectColor(patch.color) }),
			...(patch.deadline !== undefined && { deadline: validDeadline(patch.deadline) }),
			...(patch.weekGoal !== undefined && { weekGoal: validWeekGoal(patch.weekGoal) })
		}));

export const setArchived =
	(deps: ProjectDeps) => (id: string, archived: boolean, actorId: string) =>
		change(deps, id, actorId, (project) => ({
			...project,
			archivedAt: archived ? deps.clock.now().toISOString() : null
		}));
