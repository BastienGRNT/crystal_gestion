import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import { attachRealtime } from './realtime-attach.js';

const port = Number(process.env.PORT ?? 3000);
const server = createServer(handler);
attachRealtime(server);
server.listen(port, () => console.log(`Crystal listening on http://localhost:${port}`));
