import { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import { describe, expect, it } from 'vitest';
import type { WebSocket } from 'ws';
import type { Container } from '../container';
import { SESSION_COOKIE } from '../http/session-cookie';
import { createConnectionHandler } from './connection';
import { RealtimeHub } from './hub';

class FakeSocket extends EventEmitter {
	send() {}
	close() {
		this.emit('close');
	}
}

describe('realtime connection', () => {
	it('forgets a page refreshed while it was being authenticated', async () => {
		const hub = new RealtimeHub();
		const socket = new FakeSocket();
		const identity = {
			authenticate: async () => {
				socket.close();
				return { id: 'ana' };
			},
			touch: async () => {}
		};
		const handler = createConnectionHandler({ identity, hub } as unknown as Container);
		const request = { headers: { cookie: `${SESSION_COOKIE}=token` } } as IncomingMessage;

		await handler.handleConnection(socket as unknown as WebSocket, request);
		await Promise.resolve();

		expect(hub.online()).toEqual([]);
	});
});
