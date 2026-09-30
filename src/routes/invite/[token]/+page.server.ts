import { error, redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { authStep, field, signIn } from '$lib/server/http/auth-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const found = await container.projects.findInvitation(params.token).catch(() => null);
	if (!found) error(404, 'Cette invitation a expiré ou a déjà été utilisée.');
	return { projectName: found.project.name, user: locals.user };
};

export const actions: Actions = {
	join: async ({ params, locals }) => {
		const user = locals.user;
		if (!user) redirect(303, `/login?redirect=/invite/${params.token}`);
		const { project } = await container.projects.acceptInvitation(params.token, async () => user);
		redirect(303, `/p/${project.slug}`);
	},
	register: async ({ params, request, cookies }) => {
		const data = await request.formData();
		const input = {
			name: field(data, 'name'),
			email: field(data, 'email'),
			password: field(data, 'password')
		};
		return authStep(
			async () => {
				const { user, project } = await container.projects.acceptInvitation(params.token, () =>
					container.identity.register(input)
				);
				await signIn(cookies, user.id);
				return `/p/${project.slug}`;
			},
			{ name: input.name, email: input.email }
		);
	}
};
