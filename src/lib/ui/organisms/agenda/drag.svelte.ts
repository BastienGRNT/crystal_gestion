import { hourAt } from '$lib/modules/planning/domain/grid';
import { previewAt, shiftsTo, type DragOrigin } from './drag-preview';
import type { AgendaDraft, AgendaHandlers, AgendaItem, AgendaLayer, DragMode } from './types';

type Locate = (event: PointerEvent) => { day: number; minutes: number };
type Pending = DragOrigin & { x: number; y: number; touch: boolean; moved: boolean };
const DRAG_THRESHOLD_PX = 5;

/** Pointer gestures of the agenda (mouse and touch): draw, move, resize, or tap to select. */
export class AgendaDrag {
	draft = $state<AgendaDraft | null>(null);
	#pending: Pending | null = null;

	constructor(
		private locate: Locate,
		private handlers: () => AgendaHandlers
	) {}

	begin(event: PointerEvent, mode: DragMode, layer: AgendaLayer, lane: number, item?: AgendaItem) {
		if (event.button > 0) return;
		event.stopPropagation();
		const touch = event.pointerType === 'touch';
		// Touch on empty space must keep scrolling the grid natively; only items capture the gesture.
		if (!touch || item) event.preventDefault();
		const { day, minutes } = this.locate(event);
		const origin = { mode, layer, lane, day: item?.day ?? day, minutes, item: item ?? null };
		this.#pending = { ...origin, x: event.clientX, y: event.clientY, touch, moved: false };
		window.addEventListener('pointermove', this.#move);
		window.addEventListener('pointerup', this.#end);
		window.addEventListener('pointercancel', this.#stop);
	}

	#move = (event: PointerEvent) => {
		const p = this.#pending;
		if (!p || Math.hypot(event.clientX - p.x, event.clientY - p.y) < DRAG_THRESHOLD_PX) return;
		p.moved = true;
		if (p.touch && !p.item) return;
		if (p.item && (!p.item.editable || p.item.running)) return;
		this.draft = previewAt(p, this.locate(event));
	};

	#end = (event: PointerEvent) => {
		const [p, draft, handlers] = [this.#pending, this.draft, this.handlers()];
		this.#stop();
		if (!p) return;
		if (draft && !p.item) handlers.oncreate(draft.day, draft.start, draft.end, false);
		else if (draft && p.item) {
			const [start, end] = shiftsTo(p.item, draft);
			if (start || end) handlers.onchange(p.item, start, end);
		} else if (!p.moved && p.item)
			handlers.onselect(p.item, { x: event.clientX, y: event.clientY });
		else if (!p.moved && p.touch) {
			const { start, end } = hourAt(p.minutes);
			handlers.oncreate(p.day, start, end, true);
		}
	};

	#stop = () => {
		window.removeEventListener('pointermove', this.#move);
		window.removeEventListener('pointerup', this.#end);
		window.removeEventListener('pointercancel', this.#stop);
		this.#pending = null;
		this.draft = null;
	};
}
