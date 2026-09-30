import type { Project } from '$lib/modules/projects/domain/project';
import type { Container } from './container';

/** Everything a project page needs, loaded once; the client keeps it live through realtime events. */
export async function loadProjectSnapshot(c: Container, project: Project, userId: string) {
	const id = project.id;
	const [members, features, tasks, timeEntries, availabilities, journal, ideas] = await Promise.all(
		[
			c.projects.listMembers(id),
			c.features.list(id),
			c.tasks.list(id),
			c.time.list(id),
			c.planning.listForProject(id),
			c.journal.list(id),
			c.ideas.list(id)
		]
	);
	const [
		accounts,
		links,
		contacts,
		files,
		elements,
		references,
		activity,
		questions,
		notifications,
		aiNotes
	] = await Promise.all([
		c.resources.accounts.list(id),
		c.resources.links.list(id),
		c.resources.contacts.list(id),
		c.files.list(id),
		c.elements.listElements(id),
		c.elements.listReferences(id),
		c.activity.listRecent(id),
		c.discussion.openQuestions(id),
		c.notifications.list(userId, id),
		c.ai.notes.list(id)
	]);
	return {
		project,
		members,
		features,
		tasks,
		timeEntries,
		availabilities,
		journal,
		ideas,
		accounts,
		links,
		contacts,
		files,
		elements,
		references,
		activity,
		questions,
		notifications,
		aiNotes,
		online: c.presence(id)
	};
}

export type ProjectSnapshot = Awaited<ReturnType<typeof loadProjectSnapshot>>;
