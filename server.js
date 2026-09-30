import { createServer } from 'node:http';
import { attachRealtime } from './realtime-attach.js';

const port = Number(process.env.PORT ?? 3000);
// SvelteKit refuses form posts (CSRF) unless it knows the public URL: default to the local one.
process.env.ORIGIN ??= `http://localhost:${port}`;
const { handler } = await import('./build/handler.js');

const server = createServer(handler);
attachRealtime(server);
server.listen(port, () => console.log(`Crystal listening on ${process.env.ORIGIN}`));
