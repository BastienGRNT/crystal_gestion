import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';
import type { ClientEvent } from '$lib/modules/kernel/domain/realtime';
import { SESSION_COOKIE } from '$lib/server/http/session-cookie';
import type { Container } from '$lib/server/container';
import { hub, type RealtimeHub } from './hub';

type Connection = ReturnType<RealtimeHub['add']>;

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

export function createConnectionHandler(container: Container) {
	async function handle(event: ClientEvent, connection: Connection, socket: WebSocket) {
		if (event.type === 'join')
			await container.projects.assertMember(event.projectId, connection.userId).then(
				() => hub.join(connection, event.projectId),
				() => socket.close(4403, 'Forbidden')
			);
		if (event.type === 'ping' && connection.projectId)
			await container.projects.recordVisit(connection.projectId, connection.userId);
	}

	return {
		async handleConnection(socket: WebSocket, request: IncomingMessage) {
			const token = readCookie(request, SESSION_COOKIE);
			const user = token ? await container.identity.authenticate(decodeURIComponent(token)) : null;
			if (!user) return socket.close(4401, 'Unauthenticated');
			const connection = hub.add(socket, user.id);
			socket.on('close', () => hub.remove(connection));
			// A bad message must never take the whole server down: ignore it and log.
			socket.on('message', (raw) => {
				const event = parse(raw);
				if (event) handle(event, connection, socket).catch((error) => console.error('[realtime]', error));
			});
		}
	};
}
