import { error, json } from '@sveltejs/kit';
import { commands, type CommandName } from '$lib/server/commands/registry';
import { errorResponse } from '$lib/server/http/errors';
import { SESSION_COOKIE } from '$lib/server/http/session-cookie';
import type { RequestHandler } from './$types';

const isCommand = (name: string): name is CommandName => Object.hasOwn(commands, name);

export const POST: RequestHandler = async ({ params, request, locals, cookies }) => {
	if (!locals.user) error(401, 'Ta session a expiré : reconnecte-toi.');
	if (!isCommand(params.name)) error(404, 'Commande inconnue.');
	const command = commands[params.name];
	const parsed = command.input.safeParse(await request.json().catch(() => undefined));
	if (!parsed.success) return json({ message: 'Données invalides.' }, { status: 400 });
	try {
		const ctx = { userId: locals.user.id, sessionToken: cookies.get(SESSION_COOKIE) ?? '' };
		// Each entry pairs its own schema and handler; TS cannot follow that through the union.
		const run = command.run as (c: typeof ctx, input: unknown) => Promise<unknown>;
		return json((await run(ctx, parsed.data)) ?? null);
	} catch (e) {
		return errorResponse(e);
	}
};
