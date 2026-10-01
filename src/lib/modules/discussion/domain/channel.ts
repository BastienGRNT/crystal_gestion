/** A channel under « Général » (Marketing, Infra…); feature threads stay one per feature. */
export interface Channel {
	id: string;
	projectId: string;
	name: string;
	createdAt: string;
}

/** Which conversation a message belongs to: Général when both are `null`. */
export interface ThreadKey {
	featureId: string | null;
	channelId: string | null;
}

export const sameThread = (a: ThreadKey, b: ThreadKey) =>
	a.featureId === b.featureId && a.channelId === b.channelId;
