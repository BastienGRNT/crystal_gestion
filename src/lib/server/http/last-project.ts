import type { Cookies } from '@sveltejs/kit';

const COOKIE = 'crystal_last_project';

export const rememberProject = (cookies: Cookies, slug: string) =>
	cookies.set(COOKIE, slug, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});

export const lastProject = (cookies: Cookies) => cookies.get(COOKIE);
