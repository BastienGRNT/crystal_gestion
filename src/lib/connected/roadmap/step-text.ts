import { shortDay } from '$lib/client/format';
import type { StepForecast } from '$lib/client/views/roadmap';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import type { TimelineStep } from '$lib/ui/types';

/** Where a step stands, in a few words: the same on the roadmap, the home and the timeline. */
export function paceText(forecast: StepForecast | undefined): string | null {
	if (!forecast) return null;
	switch (forecast.state) {
		case 'closed':
			return null;
		case 'fits':
			return 'ça tient au rythme actuel';
		case 'late':
			return `${forecast.lateDays} j de retard au rythme actuel`;
		case 'unknown':
			return 'pas encore assez de recul pour prévoir';
		case 'undated':
			return forecast.predicted ? `prévue vers le ${shortDay(forecast.predicted)}` : null;
	}
}

export function timelineStep(
	step: Milestone,
	forecast: StepForecast | undefined,
	current: boolean
): TimelineStep {
	const progress = forecast && forecast.total ? forecast.done / forecast.total : 0;
	const tone = step.closedAt
		? 'done'
		: forecast?.state === 'late'
			? 'late'
			: current
				? 'current'
				: 'upcoming';
	const sub =
		forecast?.state === 'late' && forecast.predicted
			? `prévue le ${shortDay(forecast.predicted)}`
			: step.closedAt
				? 'close'
				: undefined;
	return {
		id: step.id,
		title: step.title,
		date: step.targetDate ? shortDay(step.targetDate) : null,
		sub,
		progress: step.closedAt ? 1 : progress,
		tone
	};
}
