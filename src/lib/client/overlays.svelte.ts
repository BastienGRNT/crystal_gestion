/** Global overlays any page can open: palette, quick idea capture, notifications. */
class Overlays {
	palette = $state(false);
	paletteQuery = $state('');
	idea = $state(false);
	ideaSeed = $state('');
	notifications = $state(false);
	mobileMenu = $state(false);

	openPalette(query = '') {
		this.paletteQuery = query;
		this.palette = true;
	}

	openIdea(seed = '') {
		this.ideaSeed = seed;
		this.idea = true;
	}
}

export const overlays = new Overlays();
