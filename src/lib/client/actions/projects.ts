import type { Project } from '$lib/modules/projects/domain/project';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { toasts } from '../toasts.svelte';
import { settle } from './optimistic';

export type ProjectPatch = Partial<
	Pick<Project, 'name' | 'description' | 'color' | 'deadline' | 'weekGoal'>
>;

export function projectActions(app: AppState) {
	function change(id: string, patch: Partial<Project>, request: Promise<Project>) {
		const current = app.projects.get(id);
		if (!current) return;
		app.projects.upsert({ ...current, ...patch });
		settle(
			app,
			id,
			request,
			(p) => app.projects.upsert(p),
			() => app.projects.upsert(current)
		);
	}

	async function attempt<T>(request: Promise<T>): Promise<T | null> {
		try {
			return await request;
		} catch (error) {
			toasts.error(errorMessage(error));
			return null;
		}
	}

	return {
		/** Waits for the server: it picks the address (slug) and opens the team and channel. */
		async create(input: {
			name: string;
			description?: string;
			color?: number;
			deadline?: string | null;
		}) {
			const project = await attempt(send('projects.create', { ...input, id: crypto.randomUUID() }));
			if (project) app.projects.upsert(project);
			return project;
		},
		update: (id: string, patch: ProjectPatch) =>
			change(id, patch, send('projects.update', { id, ...patch })),
		archive: (id: string, archived: boolean) =>
			change(
				id,
				{ archivedAt: archived ? new Date().toISOString() : null },
				send('projects.archive', { id, archived })
			),

		async invite(projectId: string) {
			const invitation = await attempt(send('projects.invite', { projectId }));
			return (
				invitation && {
					link: `${location.origin}/invite/${invitation.token}`,
					expiresAt: invitation.expiresAt
				}
			);
		},

		async removeMember(projectId: string, userId: string) {
			const done = (await attempt(send('projects.removeMember', { projectId, userId }))) !== null;
			if (done) app.members.remove(`${projectId}:${userId}`);
			return done;
		}
	};
}
