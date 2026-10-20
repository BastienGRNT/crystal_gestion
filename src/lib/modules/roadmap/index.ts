import {
	createDecision,
	deleteDecision,
	recordDecision,
	type NewDecision
} from './application/decisions';
import type { DecisionSource } from './domain/decision';
import {
	createHypothesis,
	deleteHypothesis,
	judgeHypothesis,
	updateHypothesis,
	verifyHypothesis
} from './application/hypotheses';
import {
	applyTemplate,
	closeMilestone,
	createMilestone,
	deleteMilestone,
	reorderMilestone,
	updateMilestone
} from './application/milestones';
import { createMetric, recordReading, updateMetric } from './application/metrics';
import { deleteRelease, shipRelease, updateRelease } from './application/releases';
import type { RoadmapDeps } from './application/ports';

export function createRoadmap(deps: RoadmapDeps) {
	return {
		milestonesOf: (projectIds: string[]) => deps.milestones.ofProjects(projectIds),
		decisionsOf: (projectIds: string[]) => deps.decisions.ofProjects(projectIds),
		hypothesesOf: (projectIds: string[]) => deps.hypotheses.ofProjects(projectIds),
		readingsOf: (projectIds: string[]) => deps.readings.ofProjects(projectIds),
		metricsOf: (projectIds: string[]) => deps.metrics.ofProjects(projectIds),
		releasesOf: (projectIds: string[]) => deps.releases.ofProjects(projectIds),
		createMilestone: createMilestone(deps),
		updateMilestone: updateMilestone(deps),
		reorderMilestone: reorderMilestone(deps),
		deleteMilestone: deleteMilestone(deps),
		closeMilestone: closeMilestone(deps),
		applyTemplate: applyTemplate(deps),
		createDecision: createDecision(deps),
		/** For other modules: a decision written by the app, with its source. */
		recordDecision: (input: NewDecision, actorId: string, source: DecisionSource) =>
			recordDecision(deps, input, actorId, source),
		deleteDecision: deleteDecision(deps),
		createHypothesis: createHypothesis(deps),
		updateHypothesis: updateHypothesis(deps),
		deleteHypothesis: deleteHypothesis(deps),
		verifyHypothesis: verifyHypothesis(deps),
		judgeHypothesis: judgeHypothesis(deps),
		createMetric: createMetric(deps),
		updateMetric: updateMetric(deps),
		recordReading: recordReading(deps),
		shipRelease: shipRelease(deps),
		updateRelease: updateRelease(deps),
		deleteRelease: deleteRelease(deps)
	};
}

export type Roadmap = ReturnType<typeof createRoadmap>;
