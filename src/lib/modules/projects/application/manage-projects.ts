import { notFound } from '../../kernel/domain/errors';
import {
	uniqueSlug,
	validDeadline,
	validDescription,
	validProjectColor,
	validProjectName,
	type Project
} from '../domain/project';
import type { ProjectDeps } from './ports';

export interface NewProject {
	id: string;
	name: string;
	description?: string;
	color?: number;
	deadline?: string | null;
}

export type ProjectPatch = Partial<Pick<Project, 'name' | 'description' | 'color' | 'deadline'>>;

export const createProject = (deps: ProjectDeps) => async (input: NewProject, actorId: string) => {
	const existing = await deps.projects.list();
	const name = validProjectName(input.name);
	const project: Project = {
		id: input.id,
		slug: uniqueSlug(
			name,
			existing.map((p) => p.slug)
		),
		name,
		description: validDescription(input.description ?? ''),
		color: validProjectColor(input.color ?? existing.length % 8),
		deadline: validDeadline(input.deadline ?? null),
		archivedAt: null,
		createdBy: actorId,
		createdAt: deps.clock.now().toISOString()
	};
	await deps.projects.insert(project);
	deps.feed.saved(project);
	await deps.hooks.created(project, actorId);
	await deps.activity.record({
		actorId,
		verb: 'project.created',
		subject: { kind: 'project', id: project.id, title: project.name, projectId: project.id }
	});
	return project;
};

async function change(deps: ProjectDeps, id: string, edit: (p: Project) => Project) {
	const current = await deps.projects.get(id);
	if (!current) throw notFound('Projet');
	const project = edit(current);
	await deps.projects.save(project);
	deps.feed.saved(project);
	return project;
}

export const updateProject = (deps: ProjectDeps) => (id: string, patch: ProjectPatch) =>
	change(deps, id, (project) => ({
		...project,
		...(patch.name !== undefined && { name: validProjectName(patch.name) }),
		...(patch.description !== undefined && { description: validDescription(patch.description) }),
		...(patch.color !== undefined && { color: validProjectColor(patch.color) }),
		...(patch.deadline !== undefined && { deadline: validDeadline(patch.deadline) })
	}));

export const setArchived = (deps: ProjectDeps) => (id: string, archived: boolean) =>
	change(deps, id, (project) => ({
		...project,
		archivedAt: archived ? deps.clock.now().toISOString() : null
	}));
