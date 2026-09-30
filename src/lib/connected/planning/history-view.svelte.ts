import { weekPeriod } from '$lib/modules/planning/domain/history';
import { param, setParams } from './url-state';

/** Which week the history shows: 0 = this week, 1 = last week… */
export class HistoryView {
	offset = $derived(Math.max(0, Number.parseInt(param('semaine') ?? '0', 10) || 0));
	period = $derived(weekPeriod(new Date(), this.offset));

	step = (direction: -1 | 1) => {
		const offset = Math.max(0, this.offset - direction);
		return setParams({ semaine: offset ? String(offset) : null });
	};
}
