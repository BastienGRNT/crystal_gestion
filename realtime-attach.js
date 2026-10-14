// Plain JS on purpose: shared by the Vite dev plugin and the production server (server.js).
import { WebSocketServer } from 'ws';

/** @typedef {{ handleConnection(ws: import('ws').WebSocket, request: import('node:http').IncomingMessage): unknown }} RealtimeHandler */

export const REALTIME_PATH = '/ws';
const HEARTBEAT_MS = 30_000;

/** Accepts upgrades on /ws and hands sockets to the handler SvelteKit registers on globalThis. */
/** @param {import('node:http').Server} httpServer */
export function attachRealtime(httpServer) {
	const wss = new WebSocketServer({ noServer: true });
	// A sleeping laptop or a dropped Wi-Fi never says goodbye: unanswered pings end the socket,
	// so the person stops showing as online. Browsers answer pings on their own.
	const silent = new WeakSet();
	setInterval(() => {
		for (const ws of wss.clients) {
			if (silent.has(ws)) {
				ws.terminate();
				continue;
			}
			silent.add(ws);
			ws.ping();
		}
	}, HEARTBEAT_MS).unref();
	httpServer.on('upgrade', (request, socket, head) => {
		if (!request.url?.startsWith(REALTIME_PATH)) return;
		wss.handleUpgrade(request, socket, head, (ws) => {
			// Without a listener, an 'error' event would crash the whole server.
			ws.on('error', () => ws.terminate());
			ws.on('pong', () => silent.delete(ws));
			const handler = /** @type {{ __crystalRealtime?: RealtimeHandler }} */ (globalThis)
				.__crystalRealtime;
			if (!handler) return ws.close(1013, 'Server not ready');
			Promise.resolve(handler.handleConnection(ws, request)).catch(() =>
				ws.close(1011, 'Unexpected error')
			);
		});
	});
}
