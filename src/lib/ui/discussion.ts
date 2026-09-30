import type { Component } from 'svelte';
import type { Moscow } from '$lib/modules/features/domain/feature';
import type { RefView } from './types';

export type ConvertKind = 'decision' | 'fix' | 'task' | 'idea';

/** A message prepared for display: everything MessageItem needs, nothing to compute. */
export interface MessageView {
	id: string;
	ref: string;
	body: string;
	authorName: string;
	authorColor: string;
	time: string;
	timestamp: string;
	edited: boolean;
	pending: boolean;
	mine: boolean;
	hasMentions: boolean;
	isQuestion: boolean;
	/** Other people who still have to answer the question (the reader has `askedToMe`). */
	waitingOn: string[];
	askedToMe: boolean;
	replyTo: { ref: string; author: string; excerpt: string } | null;
	/** Elements whose text points to this message (conversions, quotes). */
	links: RefView[];
	/** Same author a few minutes later: rendered without avatar and name. */
	compact: boolean;
	/** Set on the first message of each day. */
	day: string | null;
}

export interface ThreadLink {
	key: string;
	label: string;
	href: string;
	ref?: string;
	priority?: Moscow;
	active: boolean;
}

export interface MessageHandlers {
	onreply: () => void;
	onquestion: (isQuestion: boolean) => void;
	onedit: () => void;
	ondelete: () => void;
	onconvert: (kind: ConvertKind) => void;
	onresolve: () => void;
	onjump: (ref: string) => void;
}

export interface MenuAction {
	label: string;
	icon?: Component<{ size?: number }>;
	tone?: 'default' | 'danger';
	run: () => void;
}
