import { REALTIME_PATH, type ClientEvent, type ServerEvent } from '$lib/shared/realtime';

export type RealtimeStatus = 'connecting' | 'online' | 'offline';

/**
 * One socket per tab. On reconnection the caller reloads the snapshot instead of guessing what
 * was missed: simpler and always right for a small team's data.
 */
export class Realtime {
	status = $state<RealtimeStatus>('connecting');
	#socket: WebSocket | null = null;
	#attempts = 0;
	#closed = false;
	#heartbeat: ReturnType<typeof setInterval> | undefined;

	constructor(
		private onEvent: (event: ServerEvent) => void,
		private onResync: () => void
	) {}

	start() {
		this.#closed = false;
		this.#open();
		this.#heartbeat = setInterval(() => this.send({ type: 'ping' }), 25_000);
	}

	send(event: ClientEvent) {
		if (this.#socket?.readyState === WebSocket.OPEN) this.#socket.send(JSON.stringify(event));
	}

	close() {
		this.#closed = true;
		clearInterval(this.#heartbeat);
		this.#socket?.close();
	}

	#open() {
		const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
		const socket = new WebSocket(`${protocol}://${location.host}${REALTIME_PATH}`);
		this.#socket = socket;
		socket.onopen = () => {
			if (this.#attempts > 0) this.onResync();
			this.#attempts = 0;
			this.status = 'online';
		};
		socket.onmessage = (message) => this.onEvent(JSON.parse(message.data) as ServerEvent);
		socket.onclose = (event) => {
			if (this.#closed) return;
			if (event.code === 4401) return void location.assign('/login');
			this.status = 'offline';
			const delay = Math.min(15_000, 500 * 2 ** this.#attempts++);
			setTimeout(() => this.#open(), delay);
		};
	}
}
