import { CREATE_KINDS, type CreateSeed } from './create-kinds';
import { NAVIGATION, projectPath } from './navigation';
import { overlays } from './overlays.svelte';
import type { ShortcutMap } from './shortcuts';

/** Global keyboard shortcuts of a project: Cmd+K or /, one letter per thing to create, 1–7 for pages. */
export function appShortcuts(
	slug: string,
	navigate: (path: string) => void,
	seed: () => CreateSeed
): ShortcutMap {
	// Letters typed while a dialog is open belong to that dialog.
	const idle = (run: () => void) => () => {
		if (!overlays.create && !overlays.palette) run();
	};
	return {
		'mod+k': () => overlays.openPalette(),
		'/': () => overlays.openPalette(),
		...Object.fromEntries(
			CREATE_KINDS.map((kind) => [
				kind.key.toLowerCase(),
				idle(() => overlays.openCreate(kind.value, seed()))
			])
		),
		...Object.fromEntries(
			NAVIGATION.map((item, i) => [
				String(i + 1),
				idle(() => navigate(projectPath(slug, item.path)))
			])
		)
	};
}
