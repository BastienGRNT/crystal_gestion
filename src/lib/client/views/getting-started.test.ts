import { describe, expect, it } from 'vitest';
import { startSteps } from './getting-started';

const empty = {
	objective: ' ',
	featureCount: 0,
	taskCount: 0,
	memberCount: 1,
	myAvailabilityCount: 0,
	myTaskCount: 0
};

describe('getting started', () => {
	it('starts with everything to do on a brand new project', () => {
		expect(startSteps(empty).filter((step) => step.done)).toEqual([]);
	});

	it('only leaves the personal steps to a member joining a running project', () => {
		const joined = { ...empty, objective: 'Vendre', featureCount: 3, taskCount: 9, memberCount: 4 };
		expect(
			startSteps(joined)
				.filter((step) => !step.done)
				.map((step) => step.key)
		).toEqual(['availability', 'mine']);
	});
});
