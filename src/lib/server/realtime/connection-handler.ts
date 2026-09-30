import type { IncomingMessage } from 'node:http';
import type { WebSocket } from 'ws';
import type { ClientEvent } from '$lib/modules/kernel/domain/realtime';
import { SESSION_COOKIE } from '$lib/server/http/session-cookie';
import type { Container } from '$lib/server/container';
import { hub } from './hub';

const readCookie = (request: IncomingMessage, name: string) =>
	request.headers.cookie
		?.split(';')
		.map((part) => part.trim().split('='))
		.find(([key]) => key === name)?.[1];

export function createConnectionHandler(container: Container) {
	return {
		async handleConnection(socket: WebSocket, request: IncomingMessage) {
			const token = readCookie(request, SESSION_COOKIE);
			const user = token ? await container.identity.authenticate(decodeURIComponent(token)) : null;
			if (!user) return socket.close(4401, 'Unauthenticated');
			const connection = hub.add(socket, user.id);
			socket.on('close', () => hub.remove(connection));
			socket.on('message', async (raw) => {
				const event = JSON.parse(String(raw)) as ClientEvent;
				if (event.type === 'join') {
					await container.projects.assertMember(event.projectId, user.id).then(
						() => hub.join(connection, event.projectId),
						() => socket.close(4403, 'Forbidden')
					);
				}
				if (event.type === 'ping' && connection.projectId)
					await container.projects.recordVisit(connection.projectId, user.id);
			});
		}
	};
}
