import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { authStep, field, signIn } from '$lib/server/http/auth-actions';
import type { Actions, PageServerLoad } from './$types';

/** Accepts a pasted invitation link as well as a bare token. */
const inviteToken = (value: string) => value.trim().split('/invite/').pop()?.split(/[?#]/)[0] ?? '';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, '/');
	const invite = inviteToken(url.searchParams.get('invite') ?? '');
	if (invite) redirect(303, `/invite/${encodeURIComponent(invite)}`);
	return { codeEnabled: container.identity.registrationOpen() };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const input = {
			name: field(data, 'name'),
			email: field(data, 'email'),
			password: field(data, 'password'),
			code: field(data, 'code')
		};
		return authStep(
			async () => {
				const user = await container.identity.registerWithCode(input);
				await signIn(cookies, user.id);
				return '/';
			},
			{ name: input.name, email: input.email }
		);
	}
};
