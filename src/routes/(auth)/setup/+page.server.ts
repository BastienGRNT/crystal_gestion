import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { field, signIn } from '$lib/server/http/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (await container.identity.hasUsers()) redirect(303, '/login');
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const values = {
			name: field(form, 'name'),
			email: field(form, 'email'),
			password: field(form, 'password')
		};
		const failed = await signIn(cookies, url, values, () =>
			container.identity.setupFirstUser(values)
		);
		if (failed) return failed;
		redirect(303, '/');
	}
};
