import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { field, safeRedirect, signIn } from '$lib/server/http/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirect')));
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const values = {
			name: field(form, 'name'),
			email: field(form, 'email'),
			password: field(form, 'password')
		};
		const failed = await signIn(cookies, url, values, () => container.identity.register(values));
		if (failed) return failed;
		redirect(303, safeRedirect(url.searchParams.get('redirect')));
	}
};
