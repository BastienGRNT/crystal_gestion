import { container } from '$lib/server/container';
import type { PageServerLoad } from './$types';

/** Everyone on this private instance, so existing accounts can be added without an invitation link. */
export const load: PageServerLoad = async () => ({
	users: (await container.identity.listUsers()).map(({ id, name, color }) => ({ id, name, color }))
});
