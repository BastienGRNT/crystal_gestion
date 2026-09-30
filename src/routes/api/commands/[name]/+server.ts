import { error, json } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { buildCommands } from '$lib/server/commands/registry';
import type { Command } from '$lib/server/commands/define';
import { toHttpError } from '$lib/server/http/errors';
import type { RequestHandler } from './$types';

const commands: Record<string, Command> = buildCommands(container);

const projectIdOf = (input: unknown) =>
	typeof input === 'object' && input && 'projectId' in input ? String(input.projectId) : null;

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) error(401, 'Non connecté');
	const command = commands[params.name];
	if (!command) error(404, `Commande inconnue : ${params.name}`);
	try {
		const input = command.input.parse(await request.json());
		const projectId = projectIdOf(input);
		if (projectId) await container.projects.assertMember(projectId, locals.user.id);
		return json((await command.run(locals.user, input)) ?? null);
	} catch (cause) {
		toHttpError(cause);
	}
};
