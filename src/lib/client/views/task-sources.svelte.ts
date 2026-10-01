import type { ProjectStore } from '../project-store.svelte';
import { featureColors } from './feature-colors';
import { toTaskCard } from './task-card';

/** Indexes shared by every task list, rebuilt only when their source collection changes. */
export class TaskSources {
	featuresById = $derived.by(
		() => new Map(this.store.features.items.map((feature) => [feature.id, feature]))
	);
	colorOf = $derived.by(() => featureColors(this.store.features.items));
	membersById = $derived.by(
		() => new Map(this.store.members.items.map((member) => [member.id, member]))
	);

	constructor(private store: ProjectStore) {}

	priorityOf = (featureId: string | null) =>
		featureId ? (this.featuresById.get(featureId)?.priority ?? null) : null;

	card = (task: Parameters<typeof toTaskCard>[0]) =>
		toTaskCard(task, {
			featuresById: this.featuresById,
			colorOf: this.colorOf,
			membersById: this.membersById,
			entries: this.store.timeEntries.items,
			today: new Date()
		});
}
