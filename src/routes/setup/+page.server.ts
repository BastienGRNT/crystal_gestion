import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { authStep, field, signIn } from '$lib/server/http/auth-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (await container.identity.hasUsers()) redirect(303, '/login');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const input = {
			name: field(data, 'name'),
			email: field(data, 'email'),
			password: field(data, 'password')
		};
		return authStep(
			async () => {
				const user = await container.identity.setupFirstUser(input);
				await signIn(cookies, user.id);
				return '/new';
			},
			{ name: input.name, email: input.email }
		);
	}
};
