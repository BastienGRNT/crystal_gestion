import type { ServerEvent } from '$lib/shared/realtime';

export interface Socket {
	send(data: string): void;
}

/** Live sockets of the team. One workspace: every change goes to everyone connected. */
export class RealtimeHub {
	private connections = new Map<Socket, string>();

	add(socket: Socket, userId: string) {
		const wasOnline = this.isOnline(userId);
		this.connections.set(socket, userId);
		if (!wasOnline) this.announcePresence();
	}

	/** Returns the user who just went offline, if that was their last open screen. */
	remove(socket: Socket): string | null {
		const userId = this.connections.get(socket);
		this.connections.delete(socket);
		if (!userId || this.isOnline(userId)) return null;
		this.announcePresence();
		return userId;
	}

	online(): string[] {
		return [...new Set(this.connections.values())];
	}

	broadcast(event: ServerEvent, except?: string) {
		this.sendWhere((userId) => userId !== except, event);
	}

	toUser(userId: string, event: ServerEvent) {
		this.sendWhere((id) => id === userId, event);
	}

	private isOnline(userId: string) {
		return [...this.connections.values()].includes(userId);
	}

	private announcePresence() {
		this.broadcast({ type: 'presence', online: this.online() });
	}

	private sendWhere(matches: (userId: string) => boolean, event: ServerEvent) {
		const payload = JSON.stringify(event);
		for (const [socket, userId] of this.connections) {
			if (!matches(userId)) continue;
			// A socket closing mid-broadcast must not stop the others from receiving the event.
			try {
				socket.send(payload);
			} catch {
				this.connections.delete(socket);
			}
		}
	}
}

const globalStore = globalThis as { __crystalHub?: RealtimeHub };
export const hub = (globalStore.__crystalHub ??= new RealtimeHub());
