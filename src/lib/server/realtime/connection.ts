import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';
import type { ClientEvent } from '$lib/shared/realtime';
import type { Container } from '../container';
import { SESSION_COOKIE } from '../http/session-cookie';

const readCookie = (request: IncomingMessage, name: string) =>
	request.headers.cookie
		?.split(';')
		.map((part) => part.trim().split('='))
		.find(([key]) => key === name)?.[1];

function parse(raw: unknown): ClientEvent | null {
	try {
		const event = JSON.parse(String(raw));
		return event && typeof event.type === 'string' ? (event as ClientEvent) : null;
	} catch {
		return null;
	}
}

/** Authenticates a socket with the session cookie, then keeps presence and typing in sync. */
export function createConnectionHandler({ identity, hub }: Container) {
	return {
		async handleConnection(socket: WebSocket, request: IncomingMessage) {
			// Listened to first: a page refreshed while we authenticate must not stay "online".
			const closed = new Promise((resolve) => socket.once('close', resolve));
			const token = readCookie(request, SESSION_COOKIE);
			const user = token ? await identity.authenticate(decodeURIComponent(token)) : null;
			if (!user) return socket.close(4401, 'Unauthenticated');
			await hub.add(socket, user.id);
			void closed.then(() => {
				const offline = hub.remove(socket);
				if (offline) identity.touch(offline).catch((error) => console.error('[realtime]', error));
			});
			socket.on('message', (raw) => {
				const event = parse(raw);
				if (
					event?.type === 'typing' &&
					typeof event.channelId === 'string' &&
					typeof event.projectId === 'string'
				)
					hub.typing(socket, event.projectId, event.channelId);
			});
		}
	};
}
