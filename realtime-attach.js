// Plain JS on purpose: shared by the Vite dev plugin and the production server (server.js).
import { WebSocketServer } from 'ws';

/** @typedef {{ handleConnection(ws: import('ws').WebSocket, request: import('node:http').IncomingMessage): unknown }} RealtimeHandler */

export const REALTIME_PATH = '/ws';

/** Accepts upgrades on /ws and hands sockets to the handler SvelteKit registers on globalThis. */
/** @param {import('node:http').Server} httpServer */
export function attachRealtime(httpServer) {
	const wss = new WebSocketServer({ noServer: true });
	httpServer.on('upgrade', (request, socket, head) => {
		if (!request.url?.startsWith(REALTIME_PATH)) return;
		wss.handleUpgrade(request, socket, head, (ws) => {
			const handler = /** @type {{ __crystalRealtime?: RealtimeHandler }} */ (globalThis)
				.__crystalRealtime;
			if (!handler) return ws.close(1013, 'Server not ready');
			Promise.resolve(handler.handleConnection(ws, request)).catch(() =>
				ws.close(1011, 'Unexpected error')
			);
		});
	});
}
