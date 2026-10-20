import { SvelteMap } from 'svelte/reactivity';
import type { Proposal } from '$lib/modules/assistant/domain/proposal';

/** The last proposal of each button, for this visit: reopened for free while nothing moved. */
export const lastProposals = new SvelteMap<
	string,
	{ stamp: string; proposal: Proposal; costNote: string }
>();
