import { createServer } from 'node:http';
import { attachRealtime } from './realtime-attach.js';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
// SvelteKit refuses form posts (CSRF) unless it knows the public URL: default to the local one.
process.env.ORIGIN ??= `http://localhost:${port}`;
// adapter-node caps request bodies at 512 KB by default, far too small for file uploads.
process.env.BODY_SIZE_LIMIT ??= '200M';
const { handler } = await import('./build/handler.js');

const server = createServer(handler);
attachRealtime(server);
server.listen(port, host, () => console.log(`Crystal listening on ${process.env.ORIGIN}`));
