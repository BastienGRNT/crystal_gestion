import { redirect } from '@sveltejs/kit';

/** Features and ideas now live in Gestion, with the tasks. */
export const load = ({ params }) => redirect(307, `/p/${params.slug}/tasks`);
