import { NAVIGATION } from '$lib/client/navigation';
import { createShortcutHandler } from '$lib/client/shortcuts';
import type { AgendaView } from './agenda-view.svelte';

/** ← → to browse, T for today. */
export function agendaShortcuts(view: () => AgendaView) {
	return createShortcutHandler(() => ({
		// Swallow the app's "g …" sequences so "g t" (tasks) does not also jump to today.
		...Object.fromEntries(NAVIGATION.map((item) => [item.shortcut, () => {}])),
		arrowleft: () => view().step(-1),
		arrowright: () => view().step(1),
		t: () => view().today()
	}));
}
