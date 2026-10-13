/**
 * Drag and drop for the board, the matrix and the documents. Pointer events cover mouse, pen and
 * touch; on touch a long press starts the drag so the page can still scroll.
 *
 * Sortable zones follow the usual board rules: the card lifts and follows the pointer, a slot of
 * exactly its size opens where it will land, nothing else on the page moves, and releasing
 * anywhere that is not a zone puts it back home. Drop indexes count the zone's items without the
 * dragged one.
 */
import { flip } from 'svelte/animate';

type DropHandler = (itemId: string, index: number) => void;

interface ZoneOptions {
	/** For zones that keep their own order (latest first…): the slot shows where it really lands. */
	at?: 'start' | 'end';
}

interface Target {
	zone: string;
	index: number;
}

/** A sortable list as rendered during a drag: the items, plus the slot where the card would land. */
export type Row<T> = { key: string; item: T } | { key: typeof SLOT; item: null };

export const SLOT = '__slot__';

const START_DISTANCE = 5;
const TOUCH_HOLD_MS = 280;
const EDGE = 64;
const LAND_MS = 170;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animation length, or none for people who asked for less motion. */
export const motion = (ms: number) => (typeof window !== 'undefined' && reducedMotion() ? 0 : ms);

class DragAndDrop {
	active = $state<{ id: string; from: string; height: number } | null>(null);
	over = $state<Target | null>(null);

	/** The card just dropped: it is already where the slot was, it must not slide there again. */
	landed: string | null = null;

	#zones = new Map<string, { drop: DropHandler; options: ZoneOptions }>();
	#home: Target | null = null;
	#ghost: HTMLElement | null = null;
	#origin = { x: 0, y: 0 };
	#offset = { x: 0, y: 0 };
	#pointer = { x: 0, y: 0 };
	#frame = 0;

	draggable = (id: string, zone: string) => (node: HTMLElement) => {
		node.dataset.dragId = id;
		const down = (event: PointerEvent) => this.#press(event, node, id, zone);
		node.addEventListener('pointerdown', down);
		return () => node.removeEventListener('pointerdown', down);
	};

	dropzone =
		(zone: string, onDrop: DropHandler, options: ZoneOptions = {}) =>
		(node: HTMLElement) => {
			const entry = { drop: onDrop, options };
			node.dataset.dropzone = zone;
			this.#zones.set(zone, entry);
			return () => {
				if (this.#zones.get(zone) === entry) this.#zones.delete(zone);
			};
		};

	isOver(zone: string) {
		return this.over?.zone === zone;
	}

	/** The zone's items in order, with the landing slot inserted while a card hovers it. */
	rows<T extends { id: string }>(zone: string, items: T[]): Row<T>[] {
		const slotAt = this.active && this.over?.zone === zone ? this.over.index : -1;
		const rows: Row<T>[] = [];
		let index = 0;
		for (const item of items) {
			// The dragged card stays in the DOM (hidden) so touch events keep reaching it.
			if (item.id !== this.active?.id) {
				if (index === slotAt) rows.push({ key: SLOT, item: null });
				index++;
			}
			rows.push({ key: item.id, item });
		}
		if (slotAt >= index) rows.push({ key: SLOT, item: null });
		return rows;
	}

	#press(event: PointerEvent, node: HTMLElement, id: string, zone: string) {
		if (event.button !== 0 || this.active) return;
		const control = (event.target as HTMLElement).closest(
			'button, a, input, textarea, select, [data-no-drag]'
		);
		// Controls inside a card keep their own behaviour, unless marked as a drag handle.
		if (control && control !== node && !control.hasAttribute('data-drag-handle')) return;
		const start = { x: event.clientX, y: event.clientY };
		const touch = event.pointerType === 'touch';
		let timer: ReturnType<typeof setTimeout> | undefined;
		const begin = () => {
			cleanup();
			this.#start(node, id, zone);
		};
		const move = (e: PointerEvent) => {
			this.#pointer = { x: e.clientX, y: e.clientY };
			const distance = Math.hypot(e.clientX - start.x, e.clientY - start.y);
			if (touch && distance > 10) cleanup();
			else if (!touch && distance > START_DISTANCE) begin();
		};
		const cleanup = () => {
			clearTimeout(timer);
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', cleanup);
			window.removeEventListener('pointercancel', cleanup);
		};
		this.#pointer = start;
		if (touch) timer = setTimeout(begin, TOUCH_HOLD_MS);
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', cleanup);
		window.addEventListener('pointercancel', cleanup);
	}

	#start(node: HTMLElement, id: string, zone: string) {
		const rect = node.getBoundingClientRect();
		this.#home = this.#homeOf(node, id, zone);
		this.#lift(node, rect);
		this.active = { id, from: zone, height: rect.height };
		this.over = this.#home;
		// In a sortable zone the slot takes the card's place; elsewhere the card stays, faded.
		node.dataset.dragging = this.#home ? 'lifted' : 'faded';
		document.documentElement.classList.add('is-dragging');
		navigator.vibrate?.(8);

		const move = (e: PointerEvent) => {
			this.#pointer = { x: e.clientX, y: e.clientY };
			this.#track();
		};
		const blockScroll = (e: TouchEvent) => e.preventDefault();
		const end = (drop: boolean) => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', cancel);
			window.removeEventListener('keydown', escape);
			window.removeEventListener('touchmove', blockScroll);
			cancelAnimationFrame(this.#frame);
			void this.#release(node, id, drop);
		};
		const up = () => end(true);
		const cancel = () => end(false);
		const escape = (e: KeyboardEvent) => e.key === 'Escape' && end(false);
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', cancel);
		window.addEventListener('keydown', escape);
		window.addEventListener('touchmove', blockScroll, { passive: false });
		// No hit test yet: the lists have not re-rendered, the slot is not in place.
		this.#moveGhost();
		this.#autoScroll();
	}

	/** The floating copy that follows the pointer, tilted a little: it reads as "picked up". */
	#lift(node: HTMLElement, rect: DOMRect) {
		const ghost = node.cloneNode(true) as HTMLElement;
		delete ghost.dataset.dragId;
		Object.assign(ghost.style, {
			position: 'fixed',
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			margin: '0',
			zIndex: '1000',
			pointerEvents: 'none',
			borderRadius: '14px',
			boxShadow: 'var(--shadow-pop)',
			transform: reducedMotion() ? 'none' : 'rotate(2deg)',
			transition: `transform ${motion(120)}ms ease`
		});
		document.body.append(ghost);
		this.#ghost = ghost;
		this.#origin = { x: rect.left, y: rect.top };
		this.#offset = { x: this.#pointer.x - rect.left, y: this.#pointer.y - rect.top };
	}

	#homeOf(node: HTMLElement, id: string, zone: string): Target | null {
		const zoneEl = node.closest<HTMLElement>('[data-dropzone]');
		if (!zoneEl || zoneEl.dataset.dropzone !== zone || !this.#zones.has(zone)) return null;
		const items = this.#itemsOf(zoneEl, null);
		return { zone, index: Math.max(0, items.indexOf(node)) };
	}

	#itemsOf(zoneEl: HTMLElement, skip: string | null) {
		return [...zoneEl.querySelectorAll<HTMLElement>('[data-drag-id]')].filter(
			(el) => el.dataset.dragId !== skip && el.closest('[data-dropzone]') === zoneEl
		);
	}

	#moveGhost() {
		const { x, y } = this.#pointer;
		if (this.#ghost)
			this.#ghost.style.translate = `${x - this.#offset.x - this.#origin.x}px ${y - this.#offset.y - this.#origin.y}px`;
	}

	#track() {
		const { x, y } = this.#pointer;
		this.#moveGhost();
		const target = this.#targetAt(x, y) ?? (this.#inGap(x, y) ? this.over : this.#home);
		// Only a real change re-renders the lists (this runs on every frame of the auto-scroll).
		if (target?.zone !== this.over?.zone || target?.index !== this.over?.index) this.over = target;
	}

	/** Crossing the gap between two columns must not send the card home for an instant. */
	#inGap(x: number, y: number) {
		return !!document.elementFromPoint(x, y)?.closest('[data-drop-gaps]');
	}

	#targetAt(x: number, y: number): Target | null {
		const under = document.elementFromPoint(x, y);
		let zoneEl = under?.closest<HTMLElement>('[data-dropzone]') ?? null;
		// Anywhere in a column counts: the nearest of its zones takes the card.
		const area = zoneEl ? null : under?.closest<HTMLElement>('[data-drop-area]');
		if (area) zoneEl = nearestZone(area, y);
		const zone = zoneEl?.dataset.dropzone;
		const entry = zone ? this.#zones.get(zone) : undefined;
		if (!zoneEl || !zone || !entry) return null;
		const items = this.#itemsOf(zoneEl, this.active?.id ?? null);
		if (entry.options.at === 'start') return { zone, index: 0 };
		if (entry.options.at === 'end') return { zone, index: items.length };
		const index = items.findIndex((el) => y < layoutMiddle(el, zoneEl));
		return { zone, index: index < 0 ? items.length : index };
	}

	/** Scrolls a column, the page or a sideways board when the pointer nears its edge. */
	#autoScroll() {
		const step = () => {
			const { x, y } = this.#pointer;
			const under = document.elementFromPoint(x, y);
			const speed = (d: number) => Math.round(((EDGE - Math.max(0, d)) / EDGE) * 16);
			const column =
				under?.closest<HTMLElement>('[data-scroll-y]') ?? document.getElementById('page');
			if (column) {
				const r = column.getBoundingClientRect();
				if (y < r.top + EDGE) column.scrollTop -= speed(y - r.top);
				else if (y > r.bottom - EDGE) column.scrollTop += speed(r.bottom - y);
			}
			const row = under?.closest<HTMLElement>('[data-scroll-x]');
			if (row) {
				const r = row.getBoundingClientRect();
				if (x < r.left + EDGE) row.scrollLeft -= speed(x - r.left);
				else if (x > r.right - EDGE) row.scrollLeft += speed(r.right - x);
			}
			this.#track();
			this.#frame = requestAnimationFrame(step);
		};
		this.#frame = requestAnimationFrame(step);
	}

	/** The card glides into its slot (or back home), then the move is committed. */
	async #release(node: HTMLElement, id: string, drop: boolean) {
		const home = this.#home;
		if (!drop) this.over = home;
		const target = this.over;
		const moved = !!target && (target.zone !== home?.zone || target.index !== home?.index);
		await new Promise(requestAnimationFrame);
		await this.#land(target !== null);
		this.landed = id;
		if (drop && moved && target) this.#zones.get(target.zone)?.drop(id, target.index);
		this.#finish(node);
		setTimeout(() => (this.landed = null), 0);
	}

	async #land(toSlot: boolean) {
		const ghost = this.#ghost;
		const slot = toSlot
			? document.querySelector('[data-drop-slot]')?.getBoundingClientRect()
			: null;
		const ms = motion(LAND_MS);
		if (!ghost || !ms) return;
		ghost.style.transition = `translate ${ms}ms cubic-bezier(.2,.8,.2,1), transform ${ms}ms ease, opacity ${ms}ms ease`;
		ghost.style.transform = 'none';
		if (slot)
			ghost.style.translate = `${slot.left - this.#origin.x}px ${slot.top - this.#origin.y}px`;
		else ghost.style.opacity = '0';
		await new Promise((done) => setTimeout(done, ms));
	}

	#finish(node: HTMLElement) {
		this.#ghost?.remove();
		this.#ghost = null;
		this.#home = null;
		delete node.dataset.dragging;
		document.documentElement.classList.remove('is-dragging');
		this.active = null;
		this.over = null;
		// The pointerup of a drag must not also count as a click that opens the card.
		const swallow = (e: MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();
		};
		window.addEventListener('click', swallow, { capture: true, once: true });
		setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
	}
}

/**
 * Middle of an item from its layout position, not its painted one: neighbours sliding aside
 * (transforms) must not make the slot jump back and forth.
 */
function layoutMiddle(el: HTMLElement, zoneEl: HTMLElement) {
	if (el.offsetParent !== zoneEl) {
		const r = el.getBoundingClientRect();
		return r.top + r.height / 2;
	}
	return zoneEl.getBoundingClientRect().top + zoneEl.clientTop + el.offsetTop + el.offsetHeight / 2;
}

function nearestZone(area: HTMLElement, y: number): HTMLElement | null {
	let best: HTMLElement | null = null;
	let distance = Infinity;
	for (const zone of area.querySelectorAll<HTMLElement>('[data-dropzone]')) {
		const r = zone.getBoundingClientRect();
		const d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
		if (d < distance) [best, distance] = [zone, d];
	}
	return best;
}

export const dnd = new DragAndDrop();

/**
 * `animate:reflow` on the items of a sortable list: neighbours slide aside to open the slot.
 * The dropped card and the hidden one (measured with no size) jump straight to their place.
 */
export function reflow(node: Element, rects: { from: DOMRect; to: DOMRect }) {
	const id = (node as HTMLElement).dataset.dragId;
	if (!rects.from.width || (id && id === dnd.landed)) return { duration: 0 };
	return flip(node, rects, { duration: motion(180) });
}
