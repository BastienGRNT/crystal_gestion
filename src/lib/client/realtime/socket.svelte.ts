import type { ClientEvent, ServerEvent } from '$lib/modules/kernel/domain/realtime';

export type ConnectionStatus = 'connecting' | 'online' | 'offline';
type Listener = (event: ServerEvent) => void;

const PING_INTERVAL_MS = 60_000;
const MAX_BACKOFF_MS = 15_000;

/** WebSocket transport; the rest of the client only depends on subscribe/join/status. */
export class RealtimeClient {
	status = $state<ConnectionStatus>('connecting');
	private socket: WebSocket | null = null;
	private listeners = new Set<Listener>();
	private projectId: string | null = null;
	private attempts = 0;
	private pingTimer: ReturnType<typeof setInterval> | undefined;

	constructor(private onReconnect: () => void) {}

	subscribe(listener: Listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	join(projectId: string) {
		this.projectId = projectId;
		if (!this.socket) this.connect();
		else this.sendJoin();
	}

	close() {
		clearInterval(this.pingTimer);
		this.socket?.close();
		this.socket = null;
	}

	private connect() {
		const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		const socket = new WebSocket(`${protocol}://${location.host}/ws`);
		this.socket = socket;
		socket.onopen = () => this.handleOpen();
		socket.onmessage = (message) =>
			this.listeners.forEach((listen) => listen(JSON.parse(message.data)));
		socket.onclose = () => this.handleClose(socket);
	}

	private handleOpen() {
		const isReconnection = this.attempts > 0;
		this.attempts = 0;
		this.status = 'online';
		this.sendJoin();
		this.pingTimer = setInterval(() => this.send({ type: 'ping' }), PING_INTERVAL_MS);
		if (isReconnection) this.onReconnect();
	}

	private handleClose(socket: WebSocket) {
		if (this.socket !== socket) return;
		clearInterval(this.pingTimer);
		this.status = 'offline';
		this.attempts++;
		const delay = Math.min(MAX_BACKOFF_MS, 500 * 2 ** this.attempts);
		setTimeout(() => this.socket === socket && this.connect(), delay);
	}

	private sendJoin() {
		if (this.projectId) this.send({ type: 'join', projectId: this.projectId });
	}

	private send(event: ClientEvent) {
		if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(event));
	}
}
