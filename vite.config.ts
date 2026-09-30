import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import type { Server } from 'node:http';
import { attachRealtime } from './realtime-attach.js';

const attach = (server: { httpServer: unknown }) => {
	if (server.httpServer) attachRealtime(server.httpServer as Server);
};
const realtime = {
	name: 'crystal-realtime',
	configureServer: attach,
	configurePreviewServer: attach
};

export default defineConfig({
	plugins: [
		tailwindcss(),
		realtime,
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts', '../realtime-attach.js');
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
