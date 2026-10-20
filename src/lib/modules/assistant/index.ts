import { ask, monthUsage } from './application/ask';
import type { AssistantDeps } from './application/ports';

export function createAssistant(deps: AssistantDeps) {
	return {
		ask: ask(deps),
		monthUsage: monthUsage(deps),
		enabled: () => deps.llm.configured(),
		billing: deps.llm.billing,
		quota: deps.quota
	};
}

export type Assistant = ReturnType<typeof createAssistant>;
