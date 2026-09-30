export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'crystal-theme';

const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

class Theme {
	mode = $state<ThemeMode>('system');

	init() {
		const stored = localStorage.getItem(STORAGE_KEY);
		this.mode = stored === 'light' || stored === 'dark' ? stored : 'system';
		matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.apply());
	}

	set(mode: ThemeMode) {
		this.mode = mode;
		if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, mode);
		this.apply();
	}

	/** Cycles light → dark → system, the order people expect from a single button. */
	cycle() {
		this.set(this.mode === 'light' ? 'dark' : this.mode === 'dark' ? 'system' : 'light');
	}

	private apply() {
		document.documentElement.dataset.theme = this.mode === 'system' ? systemTheme() : this.mode;
	}
}

export const theme = new Theme();
