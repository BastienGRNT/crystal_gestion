import type { CreateKind, CreateSeed } from './create-kinds';

/** Global overlays any page can open: palette, « Créer » dialog, notifications. */
class Overlays {
	palette = $state(false);
	paletteQuery = $state('');
	create = $state<{ kind: CreateKind; seed: CreateSeed } | null>(null);
	notifications = $state(false);
	mobileMenu = $state(false);

	openPalette(query = '') {
		this.paletteQuery = query;
		this.palette = true;
	}

	openCreate(kind: CreateKind = 'task', seed: CreateSeed = {}) {
		this.palette = false;
		this.create = { kind, seed };
	}
}

export const overlays = new Overlays();
