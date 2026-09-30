import { error } from '@sveltejs/kit';
import { container } from '../container';

/** Resolves the signed-in member of a project, or stops the request. */
export async function requireMember(locals: App.Locals, projectId: string) {
	if (!locals.user) error(401, 'Non connecté');
	await container.projects
		.assertMember(projectId, locals.user.id)
		.catch(() => error(403, 'Accès refusé'));
	return locals.user;
}
