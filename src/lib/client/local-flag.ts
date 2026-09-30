/** A per-browser yes/no preference; blocked storage just means the default applies again. */
export function readFlag(key: string) {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
}

export function writeFlag(key: string) {
	try {
		localStorage.setItem(key, '1');
	} catch {
		// Remembered for this visit only.
	}
}
