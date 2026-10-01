import { createShortcutHandler } from '$lib/client/shortcuts';
import type { AgendaView } from './agenda-view.svelte';

/** ← → to browse, A for « aujourd’hui » (T creates a Task everywhere). */
export function agendaShortcuts(view: () => AgendaView) {
	return createShortcutHandler(() => ({
		arrowleft: () => view().step(-1),
		arrowright: () => view().step(1),
		a: () => view().today()
	}));
}
