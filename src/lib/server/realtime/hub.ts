import type { ServerEvent } from '$lib/shared/realtime';

export interface Socket {
	send(data: string): void;
}

/** Which projects someone is in, and who they share a project with (themselves included). */
export interface Audience {
	projects: Set<string>;
	people: Set<string>;
}

export type AudienceResolver = (userId: string) => Promise<Audience>;

interface Connection extends Audience {
	userId: string;
}

/** Live sockets. Each one only hears about its person's projects and teammates. */
export class RealtimeHub {
	private connections = new Map<Socket, Connection>();
	private resolve: AudienceResolver = async (userId) => ({
		projects: new Set(),
		people: new Set([userId])
	});

	configure(resolve: AudienceResolver) {
		this.resolve = resolve;
	}

	async add(socket: Socket, userId: string) {
		const wasOnline = this.isOnline(userId);
		this.connections.set(socket, { userId, ...(await this.resolve(userId)) });
		if (!wasOnline) this.announcePresence();
		else this.sendPresence(socket);
	}

	/** Returns the user who just went offline, if that was their last open screen. */
	remove(socket: Socket): string | null {
		const userId = this.connections.get(socket)?.userId;
		this.connections.delete(socket);
		if (!userId || this.isOnline(userId)) return null;
		this.announcePresence();
		return userId;
	}

	/** After someone joins or leaves a project: who hears what changes. */
	async refresh(userIds: string[]) {
		for (const [socket, connection] of this.connections)
			if (userIds.includes(connection.userId))
				this.connections.set(socket, {
					userId: connection.userId,
					...(await this.resolve(connection.userId))
				});
		this.announcePresence();
	}

	online(): string[] {
		return [...new Set([...this.connections.values()].map((c) => c.userId))];
	}

	toProject(projectId: string, event: ServerEvent, except?: string) {
		this.sendWhere((c) => c.projects.has(projectId) && c.userId !== except, event);
	}

	/** "Is typing" goes to the teammates of a project the socket's person is in. */
	typing(socket: Socket, projectId: string, channelId: string) {
		const connection = this.connections.get(socket);
		if (!connection?.projects.has(projectId)) return;
		this.toProject(
			projectId,
			{ type: 'typing', userId: connection.userId, channelId },
			connection.userId
		);
	}

	toUser(userId: string, event: ServerEvent) {
		this.sendWhere((c) => c.userId === userId, event);
	}

	/** To everyone who shares a project with this person (and to themselves). */
	toTeammatesOf(userId: string, event: ServerEvent) {
		this.sendWhere((c) => c.people.has(userId), event);
	}

	private isOnline(userId: string) {
		return [...this.connections.values()].some((c) => c.userId === userId);
	}

	private sendPresence(socket: Socket) {
		const connection = this.connections.get(socket);
		if (!connection) return;
		const online = this.online().filter((id) => connection.people.has(id));
		this.safeSend(socket, JSON.stringify({ type: 'presence', online } satisfies ServerEvent));
	}

	private announcePresence() {
		for (const socket of this.connections.keys()) this.sendPresence(socket);
	}

	private sendWhere(matches: (connection: Connection) => boolean, event: ServerEvent) {
		const payload = JSON.stringify(event);
		for (const [socket, connection] of this.connections)
			if (matches(connection)) this.safeSend(socket, payload);
	}

	/** A socket closing mid-broadcast must not stop the others from receiving the event. */
	private safeSend(socket: Socket, payload: string) {
		try {
			socket.send(payload);
		} catch {
			this.connections.delete(socket);
		}
	}
}

const globalStore = globalThis as { __crystalHub?: RealtimeHub };
export const hub = (globalStore.__crystalHub ??= new RealtimeHub());
