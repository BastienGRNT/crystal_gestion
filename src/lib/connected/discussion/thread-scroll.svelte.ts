import { tick } from 'svelte';

const NEAR_BOTTOM_PX = 160;
const HIGHLIGHT_MS = 2200;

/** Keeps a chat pinned to its latest message unless the reader scrolled up to read history. */
export class ThreadScroll {
	element = $state<HTMLElement>();
	highlighted = $state<string | null>(null);
	private pinned = true;
	private timer: ReturnType<typeof setTimeout> | undefined;

	/** Call before the DOM updates, to know whether the reader was following the conversation. */
	measure() {
		const el = this.element;
		if (el) this.pinned = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
	}

	async follow(force = false) {
		if (!this.pinned && !force) return;
		await tick();
		this.element?.scrollTo({ top: this.element.scrollHeight });
	}

	/** Scrolls to a message of this thread and flashes it; false if it is not loaded here. */
	async reveal(ref: string): Promise<boolean> {
		await tick();
		const target = this.element?.querySelector<HTMLElement>(`[id="${CSS.escape(ref)}"]`);
		if (!target) return false;
		target.scrollIntoView({ block: 'center', behavior: 'smooth' });
		clearTimeout(this.timer);
		this.highlighted = ref;
		this.timer = setTimeout(() => (this.highlighted = null), HIGHLIGHT_MS);
		return true;
	}
}
