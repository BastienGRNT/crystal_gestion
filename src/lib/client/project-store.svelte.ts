import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { EntityName, ServerEvent } from '$lib/modules/kernel/domain/realtime';
import type { Message } from '$lib/modules/discussion/domain/message';
import type { Notification } from '$lib/modules/notifications/domain/notification';
import type { ProjectSnapshot } from '$lib/server/snapshot';
import { LiveCollection } from './live/collection.svelte';
import { toSummary, withoutElement, withSource } from './live/element-index';

type Item<K extends keyof ProjectSnapshot> = ProjectSnapshot[K] extends (infer T)[] ? T : never;
const live = <K extends keyof ProjectSnapshot>() => new LiveCollection<Item<K> & { id: string }>();

/** Client read model of the current project, kept in sync by realtime events and optimistic updates. */
export class ProjectStore {
	project = $state() as ProjectSnapshot['project'];
	online = $state<string[]>([]);
	references = $state<ProjectSnapshot['references']>([]);
	members = live<'members'>();
	features = live<'features'>();
	tasks = live<'tasks'>();
	timeEntries = live<'timeEntries'>();
	availabilities = live<'availabilities'>();
	journal = live<'journal'>();
	ideas = live<'ideas'>();
	accounts = live<'accounts'>();
	links = live<'links'>();
	contacts = live<'contacts'>();
	files = live<'files'>();
	elements = new LiveCollection<ElementSummary>();
	activity = live<'activity'>();
	questions = live<'questions'>();
	notifications = live<'notifications'>();
	aiNotes = live<'aiNotes'>();
	messages = new LiveCollection<Message>();

	constructor(
		snapshot: ProjectSnapshot,
		private onNotification: (notification: Notification) => void = () => {}
	) {
		this.reset(snapshot);
	}

	/** Resets in place so every component keeps reading the same reactive collections. */
	reset(s: ProjectSnapshot) {
		this.project = s.project;
		this.online = s.online;
		this.references = s.references;
		this.members.reset(s.members);
		this.features.reset(s.features);
		this.tasks.reset(s.tasks);
		this.timeEntries.reset(s.timeEntries);
		this.availabilities.reset(s.availabilities);
		this.journal.reset(s.journal);
		this.ideas.reset(s.ideas);
		this.accounts.reset(s.accounts);
		this.links.reset(s.links);
		this.contacts.reset(s.contacts);
		this.files.reset(s.files);
		this.elements.reset(s.elements);
		this.activity.reset(s.activity);
		this.questions.reset(s.questions);
		this.notifications.reset(s.notifications);
		this.aiNotes.reset(s.aiNotes);
	}

	apply(event: ServerEvent) {
		if (event.type === 'presence') this.online = event.userIds;
		else if (event.type === 'notification') this.receive(event.data as Notification);
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

	private detachFeature(featureId: string) {
		for (const collection of [
			this.tasks,
			this.ideas,
			this.journal,
			this.files,
			this.accounts,
			this.links,
			this.messages
		])
			for (const item of collection.items as { id: string; featureId: string | null }[])
				if (item.featureId === featureId) item.featureId = null;
	}

	private collection(entity: EntityName): LiveCollection<{ id: string }> | undefined {
		const byEntity: Partial<Record<EntityName, LiveCollection<{ id: string }>>> = {
			member: this.members,
			feature: this.features,
			task: this.tasks,
			timeEntry: this.timeEntries,
			availability: this.availabilities,
			journal: this.journal,
			idea: this.ideas,
			account: this.accounts,
			link: this.links,
			contact: this.contacts,
			file: this.files,
			activity: this.activity,
			question: this.questions,
			aiNote: this.aiNotes,
			message: this.messages
		};
		return byEntity[entity];
	}
}
