import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid } from '$lib/modules/kernel/domain/errors';
import { slugify, type Framing } from '../domain/project';
import type { MemberRepository, ProjectRepository } from './ports';

export const makeCreateProject =
	(deps: { projects: ProjectRepository; members: MemberRepository }) =>
	async (actor: Actor, framing: Framing) => {
		if (!framing.name.trim()) throw invalid('Le projet a besoin d’un nom');
		const slug = await uniqueSlug(deps.projects, slugify(framing.name));
		const project = await deps.projects.create({ ...framing, slug, createdBy: actor.id });
		await deps.members.add(project.id, actor.id, 'owner');
		return project;
	};

async function uniqueSlug(projects: ProjectRepository, base: string) {
	let slug = base;
	for (let suffix = 2; await projects.slugExists(slug); suffix++) slug = `${base}-${suffix}`;
	return slug;
}
