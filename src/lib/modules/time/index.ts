import type { ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import {
	makeCreateBlock,
	makeDeleteBlock,
	makeLogTime,
	makeUpdateBlock
} from './application/blocks';
import type { TimeEntryRepository } from './application/ports';
import { makeTaskTimer } from './application/timer';

export function createTimeModule(deps: {
	entries: TimeEntryRepository;
	feed: ChangeFeed;
	clock: Clock;
}) {
	return {
		timer: makeTaskTimer(deps),
		createBlock: makeCreateBlock(deps),
		updateBlock: makeUpdateBlock(deps),
		deleteBlock: makeDeleteBlock(deps),
		logTime: makeLogTime(deps),
		list: (projectId: string) => deps.entries.list(projectId)
	};
}

export type TimeModule = ReturnType<typeof createTimeModule>;
