export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'crystal-theme';

export function storedTheme(): ThemeChoice {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'light' || value === 'dark' ? value : 'system';
	} catch {
		return 'system';
	}
}

const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;

export function applyTheme(choice: ThemeChoice) {
	try {
		if (choice === 'system') localStorage.removeItem(KEY);
		else localStorage.setItem(KEY, choice);
	} catch {
		// Private mode: the choice simply lasts until the tab closes.
	}
	const dark = choice === 'dark' || (choice === 'system' && systemDark());
	document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

/** Follows the OS switching between light and dark while "Système" is chosen. */
export function followSystemTheme() {
	const media = matchMedia('(prefers-color-scheme: dark)');
	const update = () => storedTheme() === 'system' && applyTheme('system');
	media.addEventListener('change', update);
	return () => media.removeEventListener('change', update);
}
