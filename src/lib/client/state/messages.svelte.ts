import type { Message } from '$lib/modules/chat/domain/chat';

const PAGE = 60;

class ChannelMessages {
	items = $state<Message[]>([]);
	loaded = $state(false);
	loading = $state(false);
	hasOlder = $state(true);
}

/**
 * Messages are loaded per channel when opened, then kept live. Each channel keeps one stable
 * object (its fields are reactive), so screens can grab it while rendering.
 */
export class MessageStore {
	#channels = new Map<string, ChannelMessages>();

	of(channelId: string): ChannelMessages {
		let channel = this.#channels.get(channelId);
		if (!channel) {
			channel = new ChannelMessages();
			this.#channels.set(channelId, channel);
		}
		return channel;
	}

	async load(channelId: string) {
		const channel = this.of(channelId);
		if (channel.loaded || channel.loading) return;
		await this.fetchPage(channel, channelId, null);
	}

	async loadOlder(channelId: string) {
		const channel = this.of(channelId);
		if (!channel.hasOlder || channel.loading) return;
		await this.fetchPage(channel, channelId, channel.items[0]?.createdAt ?? null);
	}

	upsert(message: Message) {
		const channel = this.#channels.get(message.channelId);
		if (!channel?.loaded) return;
		const index = channel.items.findIndex((m) => m.id === message.id);
		if (index >= 0) channel.items[index] = message;
		else
			channel.items = [...channel.items, message].sort((a, b) =>
				a.createdAt.localeCompare(b.createdAt)
			);
	}

	remove(id: string) {
		for (const channel of this.#channels.values())
			if (channel.items.some((m) => m.id === id))
				channel.items = channel.items.filter((m) => m.id !== id);
	}

	find(id: string): Message | undefined {
		for (const channel of this.#channels.values()) {
			const found = channel.items.find((m) => m.id === id);
			if (found) return found;
		}
	}

	/** After a reconnection: reload what was open rather than guessing what was missed. */
	invalidate() {
		for (const [id, channel] of this.#channels) {
			const wasLoaded = channel.loaded;
			channel.items = [];
			channel.loaded = false;
			channel.hasOlder = true;
			if (wasLoaded) void this.load(id);
		}
	}

	private async fetchPage(channel: ChannelMessages, channelId: string, before: string | null) {
		channel.loading = true;
		try {
			const query = new URLSearchParams({ limit: String(PAGE) });
			if (before) query.set('before', before);
			const response = await fetch(`/api/channels/${channelId}/messages?${query}`);
			if (!response.ok) return;
			const page: Message[] = await response.json();
			const known = new Set(channel.items.map((m) => m.id));
			channel.items = [...page.filter((m) => !known.has(m.id)), ...channel.items];
			channel.hasOlder = page.length === PAGE;
			channel.loaded = true;
		} finally {
			channel.loading = false;
		}
	}
}
