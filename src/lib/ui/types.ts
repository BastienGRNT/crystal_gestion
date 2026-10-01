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
	/** Second line: what the page is for. */
	detail?: string;
	hint?: string;
	icon?: Component<{ size?: number }>;
	run: () => void;
}

export interface PaletteGroup {
	label: string;
	items: PaletteItem[];
}

/** A titled bunch of task rows (by urgency, by status…). `color` is a CSS color. */
export interface TaskGroup {
	key: string;
	label: string;
	hint?: string;
	color: string;
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
	description: string;
	priority: Moscow;
	owner: Person | null;
	done: number;
	total: number;
	/** Open bugs. */
	bugs: number;
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

export interface MatrixCell {
	key: string;
	label: string;
	hint: string;
	tone: string;
	cards: TaskCardView[];
}

/** One choice of a click menu (status, feature, assignee, due date…). */
export interface PickOption<V> {
	value: V;
	label: string;
	active: boolean;
	dot?: string;
	person?: Person;
	icon?: Component<{ size?: number; class?: string }>;
	hint?: string;
}
