import {
	makeCreateBlock,
	makeDeleteBlock,
	makeLogTime,
	makeUpdateBlock
} from './application/blocks';
import { makeTaskTimer, type TimerDeps } from './application/timer';

export function createTimeModule(deps: TimerDeps) {
	return {
		timer: makeTaskTimer(deps),
		createBlock: makeCreateBlock(deps),
		updateBlock: makeUpdateBlock(deps),
		deleteBlock: makeDeleteBlock(deps),
		logTime: makeLogTime(deps),
		list: (projectId: string) => deps.entries.list(projectId),
		runningFor: (userId: string) => deps.running.forUser(userId)
	};
}

export type TimeModule = ReturnType<typeof createTimeModule>;
