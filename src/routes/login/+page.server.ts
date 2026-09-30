import { redirect } from '@sveltejs/kit';
import { authStep, field, safeRedirect, signIn } from '$lib/server/http/auth-actions';
import { container } from '$lib/server/container';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const email = field(data, 'email');
		return authStep(
			async () => {
				const user = await container.identity.login(email, field(data, 'password'));
				await signIn(cookies, user.id);
				return safeRedirect(url.searchParams.get('redirect'));
			},
			{ email }
		);
	}
};
