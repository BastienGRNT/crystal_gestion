import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { ActivityRepository } from './application/ports';
import { makeActivityLog } from './application/record-activity';

const RECENT_LIMIT = 300;

export function createActivityModule(deps: { activities: ActivityRepository; feed: ChangeFeed }) {
	return {
		log: makeActivityLog(deps),
		listRecent: (projectId: string) => deps.activities.listRecent(projectId, RECENT_LIMIT)
	};
}

export type ActivityModule = ReturnType<typeof createActivityModule>;
