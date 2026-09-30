import { error } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { rememberProject } from '$lib/server/http/last-project';
import { loadProjectSnapshot } from '$lib/server/snapshot';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals, cookies }) => {
	const me = locals.user!;
	const project = await container.projects.findBySlug(params.slug);
	if (!project) error(404, 'Projet introuvable');
	await container.projects
		.assertMember(project.id, me.id)
		.catch(() => error(403, 'Tu ne fais pas partie de ce projet'));
	rememberProject(cookies, project.slug);
	const [snapshot, projects, recapSince] = await Promise.all([
		loadProjectSnapshot(container, project, me.id),
		container.projects.listForUser(me.id),
		container.projects.recordVisit(project.id, me.id)
	]);
	return { snapshot, projects, me, recapSince: recapSince?.toISOString() ?? null };
};
