import { createDecision, deleteDecision } from './application/decisions';
import {
	createHypothesis,
	deleteHypothesis,
	judgeHypothesis,
	recordReading,
	updateHypothesis,
	verifyHypothesis
} from './application/hypotheses';
import {
	applyTemplate,
	closeMilestone,
	createMilestone,
	deleteMilestone,
	moveMilestone,
	updateMilestone
} from './application/milestones';
import type { RoadmapDeps } from './application/ports';

export function createRoadmap(deps: RoadmapDeps) {
	return {
		milestonesOf: (projectIds: string[]) => deps.milestones.ofProjects(projectIds),
		decisionsOf: (projectIds: string[]) => deps.decisions.ofProjects(projectIds),
		hypothesesOf: (projectIds: string[]) => deps.hypotheses.ofProjects(projectIds),
		readingsOf: (projectIds: string[]) => deps.readings.ofProjects(projectIds),
		createMilestone: createMilestone(deps),
		updateMilestone: updateMilestone(deps),
		moveMilestone: moveMilestone(deps),
		deleteMilestone: deleteMilestone(deps),
		closeMilestone: closeMilestone(deps),
		applyTemplate: applyTemplate(deps),
		createDecision: createDecision(deps),
		deleteDecision: deleteDecision(deps),
		createHypothesis: createHypothesis(deps),
		updateHypothesis: updateHypothesis(deps),
		deleteHypothesis: deleteHypothesis(deps),
		verifyHypothesis: verifyHypothesis(deps),
		judgeHypothesis: judgeHypothesis(deps),
		recordReading: recordReading(deps)
	};
}

export type Roadmap = ReturnType<typeof createRoadmap>;
