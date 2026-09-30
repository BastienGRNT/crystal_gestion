import type { Component } from 'svelte';
import type { ElementKind } from '$lib/modules/kernel/domain/element';

/** A resolved reference, ready to render as a chip with its hover preview. */
export interface RefView {
	ref: string;
	title: string;
	kind: ElementKind;
	href: string;
	status?: string | null;
}

export interface Suggestion {
	id: string;
	label: string;
	hint?: string;
	insert: string;
}

export interface PaletteItem {
	id: string;
	label: string;
	hint?: string;
	icon?: Component<{ size?: number }>;
	run: () => void;
}

export interface PaletteGroup {
	label: string;
	items: PaletteItem[];
}
