/** A reactive list kept in sync by realtime events and optimistic updates. */
export class LiveCollection<T extends { id: string }> {
	items = $state<T[]>([]);

	constructor(initial: T[] = []) {
		this.items = initial;
	}

	get(id: string): T | undefined {
		return this.items.find((item) => item.id === id);
	}

	upsert(item: T) {
		const index = this.items.findIndex((existing) => existing.id === item.id);
		if (index === -1) this.items.push(item);
		else this.items[index] = item;
	}

	/** Applies changes locally and returns a function restoring the previous state. */
	patch(id: string, changes: Partial<T>): () => void {
		const previous = this.get(id);
		if (!previous) return () => {};
		const snapshot = { ...previous };
		this.upsert({ ...previous, ...changes });
		return () => this.upsert(snapshot);
	}

	remove(id: string): () => void {
		const previous = this.get(id);
		this.items = this.items.filter((item) => item.id !== id);
		return () => previous && this.upsert(previous);
	}

	reset(items: T[]) {
		this.items = items;
	}
}
