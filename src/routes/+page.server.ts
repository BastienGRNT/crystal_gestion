import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { lastProject } from '$lib/server/http/last-project';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const projects = await container.projects.listForUser(locals.user!.id);
	if (projects.length === 0) redirect(303, '/new');
	const target = projects.find((project) => project.slug === lastProject(cookies)) ?? projects[0];
	redirect(303, `/p/${target.slug}`);
};
