import type { Feature } from '$lib/modules/features/domain/feature';
import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { AiNote } from '../domain/ai-note';
import type { ProjectContext } from '../domain/project-context';

/** Read access the context builder needs; each function is an existing module query. */
export interface ContextSources {
	project: (projectId: string) => Promise<Project | null>;
	features: (projectId: string) => Promise<Feature[]>;
	tasks: (projectId: string) => Promise<Task[]>;
	journal: (projectId: string) => Promise<JournalEntry[]>;
	elements: (projectId: string) => Promise<ElementSummary[]>;
	references: (projectId: string) => Promise<{ sourceId: string; targetId: string }[]>;
	notes: (projectId: string) => Promise<AiNote[]>;
}

export const makeBuildProjectContext = (sources: ContextSources) => async (projectId: string): Promise<ProjectContext> => {
	const [project, features, tasks, journal, elements, references, notes] = await Promise.all([
		sources.project(projectId),
		sources.features(projectId),
		sources.tasks(projectId),
		sources.journal(projectId),
		sources.elements(projectId),
		sources.references(projectId),
		sources.notes(projectId)
	]);
	const refOf = new Map(elements.map((element) => [element.id, element.ref]));
	const featureRef = (id: string | null) => (id ? (refOf.get(id) ?? null) : null);
	return {
		framing: project
			? { name: project.name, objective: project.objective, audience: project.audience, deadline: project.deadline, outOfScope: project.outOfScope, doneDefinition: project.doneDefinition }
			: {},
		features: features.map((f) => ({ ref: f.ref, title: f.title, priority: f.priority, description: f.description })),
		tasks: tasks.map((t) => ({ ref: t.ref, title: t.title, status: t.status, feature: featureRef(t.featureId), dueDate: t.dueDate })),
		journal: journal.map((j) => ({ ref: j.ref, kind: j.kind, title: j.title, details: { ...j.details, feature: featureRef(j.featureId) } })),
		references: references.map((r) => ({ from: refOf.get(r.sourceId) ?? r.sourceId, to: refOf.get(r.targetId) ?? r.targetId })),
		notes: notes.map((note) => note.content)
	};
};
