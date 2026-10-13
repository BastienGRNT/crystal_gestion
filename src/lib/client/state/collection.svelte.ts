import { SvelteMap } from 'svelte/reactivity';

/** A live, keyed set of items. Items are replaced, never mutated, so readers re-render. */
export class Collection<T> {
	#items = new SvelteMap<string, T>();

	constructor(
		items: T[] = [],
		private keyOf: (item: T) => string = (item) => (item as { id: string }).id
	) {
		this.reset(items);
	}

	get all(): T[] {
		return [...this.#items.values()];
	}

	get size() {
		return this.#items.size;
	}

	get(key: string | null | undefined): T | undefined {
		return key ? this.#items.get(key) : undefined;
	}

	upsert(item: T) {
		this.#items.set(this.keyOf(item), item);
	}

	remove(key: string) {
		this.#items.delete(key);
	}

	/** In place: components holding this collection keep seeing the new data. */
	reset(items: T[]) {
		this.#items.clear();
		for (const item of items) this.upsert(item);
	}
}
