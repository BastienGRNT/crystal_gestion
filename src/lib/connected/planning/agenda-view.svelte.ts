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

/** Which slice of time and people the agenda shows, and what dragging creates. Lives in the URL. */
export class AgendaView {
	/** Set after mount: phones default to the day view. */
	compact = $state(false);
	scale = $derived<AgendaScale>(
		param('vue') === 'jour' || (param('vue') !== 'semaine' && this.compact) ? 'day' : 'week'
	);
	audience = $derived<AgendaAudience>(param('qui') === 'moi' ? 'me' : 'team');
	layer = $derived<AgendaLayer>(param('ajout') === 'travail' ? 'block' : 'availability');
	anchor = $derived(parseDayKey(param('date')) ?? startOfDay(new Date()));
	days = $derived(this.scale === 'week' ? weekDays(this.anchor) : [this.anchor]);

	setScale = (scale: AgendaScale) => setParams({ vue: scale === 'day' ? 'jour' : 'semaine' });
	setAudience = (audience: AgendaAudience) => setParams({ qui: audience === 'me' ? 'moi' : null });
	setLayer = (layer: AgendaLayer) => setParams({ ajout: layer === 'block' ? 'travail' : null });
	today = () => setParams({ date: null });

	step = (direction: -1 | 1) => {
		const next = addDays(this.anchor, direction * (this.scale === 'week' ? 7 : 1));
		return setParams({ date: sameDay(next, new Date()) ? null : dayKey(next) });
	};
}
