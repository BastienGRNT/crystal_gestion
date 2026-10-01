import { createShortcutHandler } from '$lib/client/shortcuts';
import type { AgendaView } from './agenda-view.svelte';

/** ← → to browse, T for today. */
export function agendaShortcuts(view: () => AgendaView) {
	return createShortcutHandler(() => ({
		arrowleft: () => view().step(-1),
		arrowright: () => view().step(1),
		t: () => view().today()
	}));
}
