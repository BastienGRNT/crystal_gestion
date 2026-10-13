import { forbidden, notFound } from '../../kernel/domain/errors';
import { validChannelName, type Channel } from '../domain/chat';
import type { ChatDeps } from './ports';

async function add(deps: ChatDeps, channel: Omit<Channel, 'createdAt'>) {
	const created = { ...channel, createdAt: deps.clock.now().toISOString() };
	await deps.channels.insert(created);
	deps.channelFeed.saved(created);
	return created;
}

/** Created with the project: a team can always talk. */
export const ensureGeneral =
	(deps: ChatDeps) => async (projectId: string, actorId: string | null) =>
		(await deps.channels.generalOf(projectId)) ??
		add(deps, {
			id: crypto.randomUUID(),
			projectId,
			kind: 'general',
			name: 'général',
			taskId: null,
			createdBy: actorId
		});

export const createChannel =
	(deps: ChatDeps) =>
	async (input: { id: string; projectId: string; name: string }, actorId: string) => {
		await deps.access.assertMember(input.projectId, actorId);
		const channel = await add(deps, {
			id: input.id,
			projectId: input.projectId,
			kind: 'custom',
			name: validChannelName(input.name),
			taskId: null,
			createdBy: actorId
		});
		await deps.activity.record({
			actorId,
			verb: 'channel.created',
			subject: {
				kind: 'channel',
				id: channel.id,
				title: channel.name,
				projectId: channel.projectId,
				channelId: channel.id
			}
		});
		return channel;
	};

/** The comment thread of a task, opened on its first comment. */
export async function taskThread(deps: ChatDeps, taskId: string, actorId: string) {
	const task = await deps.tasks.get(taskId, actorId);
	return (
		(await deps.channels.ofTask(task.id)) ??
		add(deps, {
			id: crypto.randomUUID(),
			projectId: task.projectId,
			kind: 'task',
			name: '',
			taskId: task.id,
			createdBy: actorId
		})
	);
}

export async function memberChannel(deps: ChatDeps, id: string, actorId: string) {
	const channel = await deps.channels.get(id);
	if (!channel) throw notFound('Canal');
	await deps.access.assertMember(channel.projectId, actorId);
	return channel;
}

async function custom(deps: ChatDeps, id: string, actorId: string) {
	const channel = await memberChannel(deps, id, actorId);
	if (channel.kind !== 'custom')
		throw forbidden('Le canal général reste : il ne se renomme ni ne se supprime.');
	return channel;
}

export const renameChannel =
	(deps: ChatDeps) => async (id: string, name: string, actorId: string) => {
		const channel = { ...(await custom(deps, id, actorId)), name: validChannelName(name) };
		await deps.channels.save(channel);
		deps.channelFeed.saved(channel);
		return channel;
	};

export const deleteChannel = (deps: ChatDeps) => async (id: string, actorId: string) => {
	const channel = await custom(deps, id, actorId);
	await deps.channels.delete(id);
	deps.channelFeed.removed(channel);
};
