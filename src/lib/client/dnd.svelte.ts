/**
 * Drag and drop shared by the matrix and the board. Pointer events cover mouse, pen and touch;
 * on touch a long press starts the drag so the page can still scroll.
 * Drop indexes count the items of the target zone without the dragged one.
 */
type DropHandler = (itemId: string, index: number) => void;

const START_DISTANCE = 5;
const TOUCH_HOLD_MS = 280;
const EDGE = 64;

class DragAndDrop {
	active = $state<{ id: string; from: string } | null>(null);
	over = $state<{ zone: string; index: number } | null>(null);

	#zones = new Map<string, DropHandler>();
	#ghost: HTMLElement | null = null;
	#offset = { x: 0, y: 0 };
	#pointer = { x: 0, y: 0 };
	#frame = 0;

	draggable = (id: string, zone: string) => (node: HTMLElement) => {
		node.dataset.dragId = id;
		const down = (event: PointerEvent) => this.#press(event, node, id, zone);
		node.addEventListener('pointerdown', down);
		return () => node.removeEventListener('pointerdown', down);
	};

	dropzone = (zone: string, onDrop: DropHandler) => (node: HTMLElement) => {
		node.dataset.dropzone = zone;
		this.#zones.set(zone, onDrop);
		return () => {
			if (this.#zones.get(zone) === onDrop) this.#zones.delete(zone);
		};
	};

	/** Is the drop line due before item number `index` of this zone? */
	lineAt(zone: string, index: number) {
		return this.over?.zone === zone && this.over.index === index;
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
			this.#start(node, id, zone, this.#pointer);
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

	#start(node: HTMLElement, id: string, zone: string, pointer: { x: number; y: number }) {
		const rect = node.getBoundingClientRect();
		const ghost = node.cloneNode(true) as HTMLElement;
		Object.assign(ghost.style, {
			position: 'fixed',
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			margin: '0',
			zIndex: '1000',
			pointerEvents: 'none',
			boxShadow: 'var(--shadow-pop)',
			transform: 'rotate(1.2deg) scale(1.02)',
			transition: 'transform 120ms ease'
		});
		document.body.append(ghost);
		this.#ghost = ghost;
		this.#offset = { x: pointer.x - rect.left, y: pointer.y - rect.top };
		this.active = { id, from: zone };
		node.dataset.dragging = 'true';
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
			const target = this.over;
			if (drop && target) this.#zones.get(target.zone)?.(id, target.index);
			this.#finish(node);
		};
		const up = () => end(true);
		const cancel = () => end(false);
		const escape = (e: KeyboardEvent) => e.key === 'Escape' && end(false);
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', cancel);
		window.addEventListener('keydown', escape);
		window.addEventListener('touchmove', blockScroll, { passive: false });
		this.#track();
		this.#autoScroll();
	}

	#track() {
		const { x, y } = this.#pointer;
		if (this.#ghost)
			this.#ghost.style.translate = `${x - this.#offset.x - parseFloat(this.#ghost.style.left)}px ${y - this.#offset.y - parseFloat(this.#ghost.style.top)}px`;
		const zoneEl = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-dropzone]');
		const zone = zoneEl?.dataset.dropzone;
		if (!zoneEl || !zone || !this.#zones.has(zone)) return void (this.over = null);
		const items = [...zoneEl.querySelectorAll<HTMLElement>('[data-drag-id]')].filter(
			(el) => el.dataset.dragId !== this.active?.id && el.closest('[data-dropzone]') === zoneEl
		);
		const index = items.findIndex((el) => {
			const r = el.getBoundingClientRect();
			return y < r.top + r.height / 2;
		});
		this.over = { zone, index: index < 0 ? items.length : index };
	}

	/** Scrolls the page (and a horizontal board) when the pointer nears an edge. */
	#autoScroll() {
		const step = () => {
			const { x, y } = this.#pointer;
			const under = document.elementFromPoint(x, y);
			const speed = (d: number) => Math.round(((EDGE - d) / EDGE) * 14);
			// A board column scrolls on its own; elsewhere the page does.
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

	#finish(node: HTMLElement) {
		this.#ghost?.remove();
		this.#ghost = null;
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

export const dnd = new DragAndDrop();
