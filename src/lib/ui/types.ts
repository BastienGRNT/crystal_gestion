import type { Component } from 'svelte';
import type { TaskCardView } from '$lib/client/views/task-card';
import type { Moscow } from '$lib/modules/features/domain/feature';
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

export interface TodoGroup {
	key: string;
	label: string;
	hint: string;
	tone: string;
	tasks: TaskCardView[];
}

/** One input of an inline creation form; the first field is the element's title. */
export interface QuickField {
	key: string;
	label: string;
	placeholder?: string;
	type?: 'text' | 'url' | 'email' | 'tel' | 'password';
	wide?: boolean;
	mono?: boolean;
}

export interface QuestionView {
	/** Message id: resolving a question targets the message. */
	id: string;
	author: { name: string; color: string };
	excerpt: string;
	href: string;
	when: string;
}

export interface Person {
	id: string;
	name: string;
	color: string;
}

export interface FeatureRowView {
	id: string;
	ref: string;
	title: string;
	priority: Moscow;
	owner: Person | null;
	done: number;
	total: number;
	href: string;
}

export interface NavEntry {
	key: string;
	label: string;
	href: string;
	icon: Component<{ size?: number; strokeWidth?: number }>;
	shortcut?: string;
	badge: number;
}

export interface NavSection {
	label: string;
	items: NavEntry[];
}

export interface MatrixCell {
	key: string;
	label: string;
	hint: string;
	tone: string;
	cards: TaskCardView[];
}
