import {
	createEpic,
	createInitiative,
	createStory,
	deleteEpic,
	deleteInitiative,
	deleteStory,
	storyFromTask,
	updateEpic,
	updateInitiative,
	updateStory
} from './application/backlog';
import { createStakeholder, deleteStakeholder, updateStakeholder } from './application/people';
import type { FramingDeps } from './application/ports';
import {
	createJourney,
	createTerm,
	deleteJourney,
	deleteTerm,
	updateJourney,
	updateTerm
} from './application/reference';
import {
	createStrategy,
	createSwotItem,
	deleteStrategy,
	deleteSwotItem,
	strategyToEpic,
	strategyToHypothesis,
	updateStrategy,
	updateSwotItem
} from './application/strategy';

export function createFraming(deps: FramingDeps) {
	const { stores } = deps;
	return {
		/** Everything framed in these projects, for the snapshot. */
		async of(projectIds: string[]) {
			const [initiatives, epics, stories, stakeholders, journeys, terms, swot, strategies] =
				await Promise.all([
					stores.initiatives.ofProjects(projectIds),
					stores.epics.ofProjects(projectIds),
					stores.stories.ofProjects(projectIds),
					stores.stakeholders.ofProjects(projectIds),
					stores.journeys.ofProjects(projectIds),
					stores.terms.ofProjects(projectIds),
					stores.swot.ofProjects(projectIds),
					stores.strategies.ofProjects(projectIds)
				]);
			return { initiatives, epics, stories, stakeholders, journeys, terms, swot, strategies };
		},
		storyGet: (id: string) => stores.stories.get(id),
		epicGet: (id: string) => stores.epics.get(id),
		createInitiative: createInitiative(deps),
		updateInitiative: updateInitiative(deps),
		deleteInitiative: deleteInitiative(deps),
		createEpic: createEpic(deps),
		updateEpic: updateEpic(deps),
		deleteEpic: deleteEpic(deps),
		createStory: createStory(deps),
		updateStory: updateStory(deps),
		deleteStory: deleteStory(deps),
		storyFromTask: storyFromTask(deps),
		createStakeholder: createStakeholder(deps),
		updateStakeholder: updateStakeholder(deps),
		deleteStakeholder: deleteStakeholder(deps),
		createJourney: createJourney(deps),
		updateJourney: updateJourney(deps),
		deleteJourney: deleteJourney(deps),
		createTerm: createTerm(deps),
		updateTerm: updateTerm(deps),
		deleteTerm: deleteTerm(deps),
		createSwotItem: createSwotItem(deps),
		updateSwotItem: updateSwotItem(deps),
		deleteSwotItem: deleteSwotItem(deps),
		createStrategy: createStrategy(deps),
		updateStrategy: updateStrategy(deps),
		deleteStrategy: deleteStrategy(deps),
		strategyToEpic: strategyToEpic(deps),
		strategyToHypothesis: strategyToHypothesis(deps)
	};
}

export type Framing = ReturnType<typeof createFraming>;
