import type { Message } from '$lib/modules/discussion/domain/message';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { EntityName } from '$lib/modules/kernel/domain/realtime';
import type { ProjectSnapshot } from '$lib/server/snapshot';
import { LiveCollection } from './collection.svelte';

type Item<K extends keyof ProjectSnapshot> = ProjectSnapshot[K] extends (infer T)[] ? T : never;
const live = <K extends keyof ProjectSnapshot>() => new LiveCollection<Item<K> & { id: string }>();
type AnyCollection = LiveCollection<{ id: string }>;

/** Which collection a realtime event about an entity lands in. */
const BY_ENTITY = {
	member: 'members',
	feature: 'features',
	task: 'tasks',
	timeEntry: 'timeEntries',
	availability: 'availabilities',
	journal: 'journal',
	idea: 'ideas',
	account: 'accounts',
	link: 'links',
	contact: 'contacts',
	file: 'files',
	activity: 'activity',
	question: 'questions',
	aiNote: 'aiNotes'
} as const satisfies Partial<Record<EntityName, keyof ProjectSnapshot>>;

const FROM_SNAPSHOT = [...Object.values(BY_ENTITY), 'notifications', 'elements'] as const;

/** The live collections of a project; `ProjectStore` adds the realtime and single-value state. */
export class ProjectCollections {
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
	activity = live<'activity'>();
	questions = live<'questions'>();
	notifications = live<'notifications'>();
	aiNotes = live<'aiNotes'>();
	elements = new LiveCollection<ElementSummary>();
	/** Loaded thread by thread, not part of the snapshot. */
	messages = new LiveCollection<Message>();

	/** In place: components keep reading the same reactive collections. */
	protected resetCollections(s: ProjectSnapshot) {
		for (const key of FROM_SNAPSHOT)
			(this[key] as unknown as AnyCollection).reset(s[key] as { id: string }[]);
	}

	protected collection(entity: EntityName): AnyCollection | undefined {
		if (entity === 'message') return this.messages as unknown as AnyCollection;
		const key = BY_ENTITY[entity as keyof typeof BY_ENTITY];
		return key && (this[key] as unknown as AnyCollection);
	}

	/** A deleted feature leaves its tasks, ideas, entries, files… in place, just unattached. */
	protected detachFeature(featureId: string) {
		const attached = [
			this.tasks,
			this.ideas,
			this.journal,
			this.files,
			this.accounts,
			this.links,
			this.messages
		];
		for (const collection of attached)
			for (const item of collection.items as { featureId: string | null }[])
				if (item.featureId === featureId) item.featureId = null;
	}
}
