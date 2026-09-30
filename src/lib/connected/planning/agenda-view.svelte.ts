import {
	addDays,
	dayKey,
	parseDayKey,
	sameDay,
	startOfDay,
	weekDays
} from '$lib/modules/planning/domain/calendar';
import type { AgendaAudience, AgendaLayer, AgendaScale } from '$lib/ui/organisms/agenda/types';
import { param, setParams } from './url-state';

/** Which slice of time and people the agenda shows, and what dragging creates. */
export class AgendaView {
	/** Set after mount: phones default to the day view. */
	compact = $state(false);
	scale = $derived<AgendaScale>(
		param('scale') === 'day' || (param('scale') !== 'week' && this.compact) ? 'day' : 'week'
	);
	audience = $derived<AgendaAudience>(param('view') === 'team' ? 'team' : 'me');
	layer = $derived<AgendaLayer>(param('mode') === 'work' ? 'block' : 'availability');
	anchor = $derived(parseDayKey(param('date')) ?? startOfDay(new Date()));
	days = $derived(this.scale === 'week' ? weekDays(this.anchor) : [this.anchor]);

	setScale = (scale: AgendaScale) => setParams({ scale });
	setAudience = (audience: AgendaAudience) =>
		setParams({ view: audience === 'team' ? 'team' : null });
	setLayer = (layer: AgendaLayer) => setParams({ mode: layer === 'block' ? 'work' : null });
	today = () => setParams({ date: null });

	step = (direction: -1 | 1) => {
		const next = addDays(this.anchor, direction * (this.scale === 'week' ? 7 : 1));
		return setParams({ date: sameDay(next, new Date()) ? null : dayKey(next) });
	};
}
