import type { z } from 'zod';
import type { CommandMap, CommandName } from '$lib/server/commands/registry';

export type CommandInput<N extends CommandName> = z.input<CommandMap[N]['input']>;
export type CommandOutput<N extends CommandName> = Awaited<ReturnType<CommandMap[N]['run']>>;

export class CommandError extends Error {}

export async function send<N extends CommandName>(
	name: N,
	input: CommandInput<N>
): Promise<CommandOutput<N>> {
	const response = await fetch(`/api/commands/${name}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(input)
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new CommandError(body?.message ?? 'Action impossible, réessaie.');
	return body as CommandOutput<N>;
}
