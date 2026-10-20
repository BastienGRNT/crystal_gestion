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

/** A step of the roadmap, as pickers show it. */
export interface StepOption {
	id: string;
	title: string;
	current?: boolean;
}

/** A segment of the roadmap's timeline. */
export interface TimelineStep {
	id: string;
	title: string;
	/** "14 nov." or nothing for a step without a date. */
	date: string | null;
	/** Where it stands at the current pace ("prévue le 21 nov."). */
	sub?: string;
	/** Done share of its tasks, 0 to 1. */
	progress: number;
	tone: 'done' | 'current' | 'late' | 'upcoming';
}

/** A way to start a project, as the project dialog offers it. */
export interface TemplateOption<K extends string = string> {
	key: K;
	name: string;
	summary: string;
	/** Its steps' names, in order. */
	steps: string[];
}

/** A button of the text editor's toolbar. */
export type TextFormat = 'bold' | 'italic' | 'h1' | 'h2' | 'bullet' | 'number' | 'quote' | 'link';

/** A line of a document's table of contents. */
export interface DocEntry {
	id: string;
	label: string;
	count?: number;
	tone?: 'warn';
}

/** An acceptance criterion of a user story, with its optional test data. */
export interface CriterionItem {
	id: string;
	text: string;
	done: boolean;
	data: string;
	expected: string;
}

/** A question of the AI project manager: pick an option or write something else. */
export interface AssistantQuestion {
	text: string;
	options: string[];
	suggested: string;
}

/** One change the AI project manager proposes, as the review panel shows it. */
export interface ProposedChange {
	id: string;
	label: string;
	/** Its main text, which the person may rewrite; null when there is none. */
	text: string | null;
	details: string[];
	reason: string;
	sources: string[];
}
