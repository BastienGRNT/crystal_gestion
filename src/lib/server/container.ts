import { hub } from './realtime/hub';
import { wireAi } from './wiring/ai';
import { wireCollaboration } from './wiring/collaboration';
import { wireCore } from './wiring/core';
import { wireWork } from './wiring/work';

/** Composition root: the only place (with `wiring/`) where concrete adapters meet use cases. */
export function createContainer() {
	const core = wireCore();
	const work = wireWork(core);
	const { clock, identity, projects, elements, activity, notifications } = core;
	return {
		...{ clock, identity, projects, elements, activity, notifications },
		...work,
		...wireCollaboration(core),
		ai: wireAi(core, work),
		presence: (projectId: string) => hub.onlineUserIds(projectId)
	};
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
