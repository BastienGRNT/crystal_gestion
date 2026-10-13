import {
	answers,
	askedIn,
	validBody,
	validChannelName,
	type Message
} from '$lib/modules/chat/domain/chat';
import { errorMessage, send } from '../api';
import { toStored } from '../mentions';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';
import { attempt, settle } from './optimistic';

export function chatActions(app: AppState) {
	function markRead(channelId: string) {
		// Read where it was said: its mentions (and answers) are no longer news either.
		const mentions = app.notifications.all.filter(
			(n) => !n.readAt && n.subject.channelId === channelId
		);
		if (mentions.length) {
			const now = new Date().toISOString();
			for (const n of mentions) app.notifications.upsert({ ...n, readAt: now });
			void send('notifications.read', { ids: mentions.map((n) => n.id) }).catch(() => {});
		}
		const state = app.channelStates.get(channelId);
		if (state && !state.unread && !state.mentions) return;
		app.channelStates.upsert({
			channelId,
			lastReadAt: new Date().toISOString(),
			unread: 0,
			mentions: 0,
			total: state?.total ?? 0
		});
		void send('chat.read', { channelId }).catch(() => {});
	}

	/** An answer shows at once: the questions it closes leave the screens before the server says so. */
	function closeAnswered(reply: Pick<Message, 'authorId' | 'replyToId' | 'channelId'>) {
		const inThread = app.channels.get(reply.channelId)?.kind === 'task';
		const answered = app.questions.all.filter((q) => answers(reply, q, inThread));
		const at = new Date().toISOString();
		for (const question of answered) app.putMessage({ ...question, answeredAt: at });
		return () => answered.forEach((question) => app.putMessage(question));
	}

	const attachmentsOf = (fileIds: string[]) =>
		fileIds.flatMap((id) => {
			const file = app.files.get(id);
			return file ? [{ id: file.id, name: file.name, mime: file.mime, size: file.size }] : [];
		});

	return {
		markRead,

		/** Resolves to false when the message could not be sent, so the composer keeps the text. */
		async post(
			channelId: string,
			text: string,
			fileIds: string[] = [],
			replyToId: string | null = null
		) {
			const channel = app.channels.get(channelId);
			const body = attempt(() => validBody(toStored(text, app.users.all), fileIds.length > 0));
			if (body === null || !channel) return false;
			const id = crypto.randomUUID();
			const draft: Message = {
				id,
				channelId,
				projectId: channel.projectId,
				authorId: app.meId,
				body,
				replyToId,
				createdAt: new Date().toISOString(),
				editedAt: null,
				attachments: attachmentsOf(fileIds),
				asks: askedIn(body, app.meId),
				answeredAt: null
			};
			app.putMessage(draft);
			const reopen = closeAnswered(draft);
			const saved = await settle(
				app,
				id,
				send('chat.post', { id, channelId, body, fileIds, replyToId }),
				(m) => app.putMessage(m),
				() => (app.dropMessage(id), reopen())
			);
			return saved !== undefined;
		},

		/** Comments on a task. The first one opens its thread on the server, so this one waits. */
		async comment(taskId: string, text: string, fileIds: string[] = []) {
			const body = attempt(() => validBody(toStored(text, app.users.all), fileIds.length > 0));
			if (body === null) return false;
			try {
				const message = await send('chat.comment', {
					id: crypto.randomUUID(),
					taskId,
					body,
					fileIds
				});
				app.putMessage(message);
				closeAnswered(message);
				return true;
			} catch (error) {
				toasts.error(errorMessage(error));
				return false;
			}
		},

		edit(message: Message, text: string) {
			const body = attempt(() =>
				validBody(toStored(text, app.users.all), message.attachments.length > 0)
			);
			if (body === null || body === message.body) return;
			app.putMessage({
				...message,
				body,
				editedAt: new Date().toISOString(),
				asks: message.answeredAt ? message.asks : askedIn(body, app.meId)
			});
			settle(
				app,
				message.id,
				send('chat.edit', { id: message.id, body }),
				(m) => app.putMessage(m),
				() => app.putMessage(message)
			);
		},

		/** "Déjà répondu": the question leaves everyone's screens. */
		resolve(question: Message) {
			app.putMessage({ ...question, answeredAt: new Date().toISOString() });
			settle(
				app,
				question.id,
				send('chat.resolve', { id: question.id }),
				(m) => app.putMessage(m),
				() => app.putMessage(question)
			);
		},

		remove(message: Message) {
			deleteWithUndo(
				'Message supprimé',
				() => app.dropMessage(message.id),
				() => app.putMessage(message),
				() =>
					void send('chat.delete', { id: message.id }, { keepalive: true }).catch(() =>
						app.putMessage(message)
					)
			);
		},

		createChannel(projectId: string, name: string) {
			const clean = attempt(() => validChannelName(name));
			if (!clean) return null;
			const id = crypto.randomUUID();
			const channel = {
				id,
				projectId,
				kind: 'custom' as const,
				name: clean,
				taskId: null,
				createdBy: app.meId,
				createdAt: new Date().toISOString()
			};
			app.channels.upsert(channel);
			settle(
				app,
				id,
				send('channels.create', { id, projectId, name }),
				(c) => app.channels.upsert(c),
				() => app.channels.remove(id)
			);
			return channel;
		},

		renameChannel(id: string, name: string) {
			const current = app.channels.get(id);
			const clean = attempt(() => validChannelName(name));
			if (!current || !clean) return;
			app.channels.upsert({ ...current, name: clean });
			settle(
				app,
				id,
				send('channels.rename', { id, name }),
				(c) => app.channels.upsert(c),
				() => app.channels.upsert(current)
			);
		},

		removeChannel(id: string, onHidden: () => void) {
			const channel = app.channels.get(id);
			if (!channel) return;
			deleteWithUndo(
				`#${channel.name} supprimé`,
				() => {
					app.channels.remove(id);
					onHidden();
				},
				() => app.channels.upsert(channel),
				() =>
					void send('channels.delete', { id }, { keepalive: true }).catch(() =>
						app.channels.upsert(channel)
					)
			);
		}
	};
}
