import type { EntityName, ServerEvent } from '$lib/modules/kernel/domain/realtime';
import type { Notification } from '$lib/modules/notifications/domain/notification';
import type { RunningTimer } from '$lib/modules/time/domain/running-timer';
import type { ProjectSnapshot } from '$lib/server/snapshot';
import { toSummary, withoutElement, withSource } from './live/element-index';
import { ProjectCollections } from './live/project-collections.svelte';

/** Client read model of the current project, kept in sync by realtime events and optimistic updates. */
export class ProjectStore extends ProjectCollections {
	project = $state() as ProjectSnapshot['project'];
	online = $state<string[]>([]);
	/** My running timer, possibly in another project. */
	timer = $state<RunningTimer | null>(null);
	references = $state<ProjectSnapshot['references']>([]);

	constructor(
		snapshot: ProjectSnapshot,
		private onNotification: (notification: Notification) => void = () => {}
	) {
		super();
		this.reset(snapshot);
	}

	/** Resets in place so every component keeps reading the same reactive collections. */
	reset(s: ProjectSnapshot) {
		this.project = s.project;
		this.online = s.online;
		this.timer = s.timer;
		this.references = s.references;
		this.resetCollections(s);
	}

	apply(event: ServerEvent) {
		if (event.type === 'presence') this.online = event.userIds;
		else if (event.type === 'notification') this.receive(event.data as Notification);
		else if (event.type === 'timer') this.timer = event.data as RunningTimer | null;
		else if (event.type === 'upsert') this.upsert(event.entity, event.data);
		else this.remove(event.entity, event.id);
	}

	/** Records an element locally (optimistic creation or server echo) in its collection and the index. */
	upsert(entity: EntityName, data: unknown) {
		if (entity === 'project') this.project = data as ProjectSnapshot['project'];
		else if (entity === 'reference')
			this.references = withSource(
				this.references,
				data as { sourceId: string; targetIds: string[] }
			);
		else this.collection(entity)?.upsert(data as { id: string });
		const summary = toSummary(data, this.elements);
		if (summary) this.elements.upsert(summary);
	}

	remove(entity: EntityName, id: string) {
		this.collection(entity)?.remove(id);
		this.elements.remove(id);
		this.references = withoutElement(this.references, id);
		if (entity === 'feature') this.detachFeature(id);
	}

	private receive(notification: Notification) {
		if (notification.projectId !== this.project.id) return;
		this.notifications.upsert(notification);
		this.onNotification(notification);
	}
}
