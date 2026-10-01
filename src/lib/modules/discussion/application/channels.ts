import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid, notFound } from '$lib/modules/kernel/domain/errors';
import type { ChannelRepository } from './ports';

type Target = { projectId: string; id: string };

const cleanName = (name: string) => {
	const clean = name.trim().replace(/^#/, '').trim();
	if (!clean) throw invalid('Le canal n’a pas de nom');
	return clean;
};

export function makeChannelUseCases(deps: { channels: ChannelRepository; feed: ChangeFeed }) {
	return {
		create: async (_actor: Actor, { projectId, name }: { projectId: string; name: string }) => {
			const channel = await deps.channels.create({ projectId, name: cleanName(name) });
			deps.feed.upserted('channel', projectId, channel);
			return channel;
		},
		rename: async (_actor: Actor, { projectId, id, name }: Target & { name: string }) => {
			const channel = await deps.channels.rename(projectId, id, cleanName(name));
			if (!channel) throw notFound('Canal');
			deps.feed.upserted('channel', projectId, channel);
			return channel;
		},
		/** Its messages go with it. */
		remove: async (_actor: Actor, { projectId, id }: Target) => {
			if (!(await deps.channels.delete(projectId, id))) throw notFound('Canal');
			deps.feed.deleted('channel', projectId, id);
		},
		list: (projectId: string) => deps.channels.list(projectId)
	};
}
