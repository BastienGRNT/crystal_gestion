import { forbidden, notFound } from '../../kernel/domain/errors';
import { validChannelName, type Channel } from '../domain/chat';
import type { ChatDeps } from './ports';

async function add(deps: ChatDeps, channel: Omit<Channel, 'createdAt'>) {
	const created = { ...channel, createdAt: deps.clock.now().toISOString() };
	await deps.channels.insert(created);
	deps.channelFeed.saved(created);
	return created;
}

/** The team-wide channel; created on first need so a fresh install always has one. */
export const ensureGeneral = (deps: ChatDeps) => async (actorId: string | null) =>
	(await deps.channels.findGeneral()) ??
	add(deps, {
		id: crypto.randomUUID(),
		kind: 'general',
		name: 'général',
		projectId: null,
		createdBy: actorId
	});

export const createProjectChannel =
	(deps: ChatDeps) => (project: { id: string }, actorId: string) =>
		add(deps, {
			id: crypto.randomUUID(),
			kind: 'project',
			name: '',
			projectId: project.id,
			createdBy: actorId
		});

export const createTopic =
	(deps: ChatDeps) => async (input: { id: string; name: string }, actorId: string) => {
		const channel = await add(deps, {
			id: input.id,
			kind: 'topic',
			name: validChannelName(input.name),
			projectId: null,
			createdBy: actorId
		});
		await deps.activity.record({
			actorId,
			verb: 'channel.created',
			subject: { kind: 'channel', id: channel.id, title: channel.name, projectId: null }
		});
		return channel;
	};

async function topic(deps: ChatDeps, id: string) {
	const channel = await deps.channels.get(id);
	if (!channel) throw notFound('Canal');
	if (channel.kind !== 'topic')
		throw forbidden(
			'Ce canal existe tant que son projet existe : il ne se renomme ni ne se supprime.'
		);
	return channel;
}

export const renameTopic = (deps: ChatDeps) => async (id: string, name: string) => {
	const channel = { ...(await topic(deps, id)), name: validChannelName(name) };
	await deps.channels.save(channel);
	deps.channelFeed.saved(channel);
	return channel;
};

export const deleteTopic = (deps: ChatDeps) => async (id: string) => {
	await topic(deps, id);
	await deps.channels.delete(id);
	deps.channelFeed.removed(id);
};
