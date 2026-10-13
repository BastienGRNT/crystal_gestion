import type { LucideIcon } from '@lucide/svelte';

export type Icon = LucideIcon;

export interface Person {
	id: string;
	name: string;
	color: number;
}

export interface MenuItem {
	label: string;
	icon?: Icon;
	shortcut?: string;
	danger?: boolean;
	disabled?: boolean;
	run: () => void;
}

export type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
