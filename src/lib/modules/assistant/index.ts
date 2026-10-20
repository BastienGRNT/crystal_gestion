import { ask, monthUsage } from './application/ask';
import type { AssistantDeps } from './application/ports';

export function createAssistant(deps: AssistantDeps) {
	return {
		ask: ask(deps),
		monthUsage: monthUsage(deps),
		enabled: () => deps.llm.configured(),
		quota: deps.quota
	};
}

export type Assistant = ReturnType<typeof createAssistant>;
