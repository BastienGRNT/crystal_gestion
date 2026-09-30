import type { ServerEvent } from '$lib/modules/kernel/domain/realtime';

export interface Socket {
	send(data: string): void;
}

interface Connection {
	socket: Socket;
	userId: string;
	projectId: string | null;
}

/** Keeps live sockets per project; survives dev hot reloads through globalThis. */
export class RealtimeHub {
	private connections = new Set<Connection>();

	add(socket: Socket, userId: string): Connection {
		const connection = { socket, userId, projectId: null };
		this.connections.add(connection);
		return connection;
	}

	remove(connection: Connection) {
		this.connections.delete(connection);
		if (connection.projectId) this.announcePresence(connection.projectId);
	}

	join(connection: Connection, projectId: string) {
		const previous = connection.projectId;
		connection.projectId = projectId;
		if (previous && previous !== projectId) this.announcePresence(previous);
		this.announcePresence(projectId);
	}

	toProject(projectId: string, event: ServerEvent) {
		this.sendWhere((c) => c.projectId === projectId, event);
	}

	toUser(userId: string, event: ServerEvent) {
		this.sendWhere((c) => c.userId === userId, event);
	}

	onlineUserIds(projectId: string): string[] {
		const ids = [...this.connections].filter((c) => c.projectId === projectId).map((c) => c.userId);
		return [...new Set(ids)];
	}

	private announcePresence(projectId: string) {
		this.toProject(projectId, {
			type: 'presence',
			projectId,
			userIds: this.onlineUserIds(projectId)
		});
	}

	private sendWhere(matches: (connection: Connection) => boolean, event: ServerEvent) {
		const payload = JSON.stringify(event);
		for (const connection of this.connections) if (matches(connection)) this.safeSend(connection, payload);
	}

	/** A socket closing mid-broadcast must not stop the others from receiving the event. */
	private safeSend(connection: Connection, payload: string) {
		try {
			connection.socket.send(payload);
		} catch {
			this.connections.delete(connection);
		}
	}
}

const globalStore = globalThis as { __crystalHub?: RealtimeHub };
export const hub = (globalStore.__crystalHub ??= new RealtimeHub());
