import { fail, type Cookies } from '@sveltejs/kit';
import { formError } from './errors';
import { setSessionCookie } from './session-cookie';

/** Only paths of this app: a crafted `?redirect=https://…` must not send people elsewhere. */
export function safeRedirect(target: string | null): string {
	return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

export const field = (form: FormData, name: string) => String(form.get(name) ?? '');

/** Runs a sign-in style action: sets the session cookie, or returns the message to show. */
export async function signIn<Values extends { password: string }>(
	cookies: Cookies,
	url: URL,
	values: Values,
	run: () => Promise<{ token: string }>
) {
	try {
		const { token } = await run();
		setSessionCookie(cookies, token, url);
		return null;
	} catch (error) {
		const { password: _, ...kept } = values;
		return fail(400, { ...kept, message: formError(error) });
	}
}
