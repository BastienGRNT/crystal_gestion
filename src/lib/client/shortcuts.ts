export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

const isTyping = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

const SEQUENCE_TIMEOUT_MS = 900;

/**
 * Keys are like "mod+k" (always active), "i" or "g t" (ignored while typing).
 * Returns the keydown handler to attach to the window.
 */
export function createShortcutHandler(shortcuts: () => ShortcutMap) {
	let pending: string | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	return (event: KeyboardEvent) => {
		const map = shortcuts();
		const key = event.key.toLowerCase();
		if ((event.metaKey || event.ctrlKey) && map[`mod+${key}`]) {
			event.preventDefault();
			return map[`mod+${key}`](event);
		}
		if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
		const combo = pending ? `${pending} ${key}` : key;
		clearTimeout(timer);
		pending = null;
		if (map[combo]) {
			event.preventDefault();
			return map[combo](event);
		}
		if (Object.keys(map).some((shortcut) => shortcut.startsWith(`${key} `))) {
			pending = key;
			timer = setTimeout(() => (pending = null), SEQUENCE_TIMEOUT_MS);
		}
	};
}
