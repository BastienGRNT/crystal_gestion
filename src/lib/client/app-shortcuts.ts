import { NAVIGATION, projectPath } from './navigation';
import { overlays } from './overlays.svelte';
import type { ShortcutMap } from './shortcuts';

/** Global keyboard shortcuts of a project: Cmd+K, quick capture and "g + letter" navigation. */
export function appShortcuts(slug: string, navigate: (path: string) => void): ShortcutMap {
	return {
		'mod+k': () => overlays.openPalette(),
		i: () => overlays.openIdea(),
		c: () => overlays.openPalette(),
		...Object.fromEntries(NAVIGATION.map((item) => [item.shortcut, () => navigate(projectPath(slug, item.path))]))
	};
}
