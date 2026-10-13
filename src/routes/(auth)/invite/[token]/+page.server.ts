import { fail, redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { field, signIn } from '$lib/server/http/auth';
import { formError } from '$lib/server/http/errors';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => ({
	invitation: await container.projects.inspectInvitation(params.token),
	signedInAs: locals.user?.name ?? null
});

export const actions: Actions = {
	/** Already has an account and is signed in: one click to join. */
	join: async ({ params, locals }) => {
		if (!locals.user) redirect(303, `/login?redirect=/invite/${params.token}`);
		let slug: string;
		try {
			slug = (await container.projects.join(params.token, locals.user.id)).slug;
		} catch (error) {
			return fail(400, { message: formError(error) });
		}
		redirect(303, `/p/${slug}`);
	},
	/** New to Crystal: the account is created and joins the project in the same step. */
	register: async ({ request, cookies, url, params }) => {
		if (!(await container.projects.inspectInvitation(params.token)))
			return fail(400, { message: 'Ce lien d’invitation a expiré ou a déjà servi.' });
		const form = await request.formData();
		const values = {
			name: field(form, 'name'),
			email: field(form, 'email'),
			password: field(form, 'password')
		};
		let slug = '';
		const failed = await signIn(cookies, url, values, async () => {
			const signedIn = await container.identity.register(values);
			slug = (await container.projects.join(params.token, signedIn.user.id)).slug;
			return signedIn;
		});
		if (failed) return failed;
		redirect(303, `/p/${slug}`);
	}
};
