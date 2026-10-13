import type { WorkStatus } from '$lib/modules/identity/domain/user';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { toasts } from '../toasts.svelte';
import { settle } from './optimistic';

export function peopleActions(app: AppState) {
	function updateMe(patch: {
		name?: string;
		color?: number;
		status?: WorkStatus;
		statusNote?: string | null;
	}) {
		const current = app.me;
		app.users.upsert({ ...current, ...patch });
		settle(
			app,
			current.id,
			send('me.update', patch),
			(u) => app.users.upsert(u),
			() => app.users.upsert(current)
		);
	}

	return {
		updateMe,
		setStatus: (status: WorkStatus, statusNote: string | null = null) =>
			updateMe({ status, statusNote }),

		async changePassword(current: string, next: string) {
			try {
				await send('me.changePassword', { current, next });
				toasts.show('Mot de passe changé. Tes autres appareils sont déconnectés.', {
					tone: 'success'
				});
				return true;
			} catch (error) {
				toasts.error(errorMessage(error));
				return false;
			}
		},

		markNotificationsRead(ids: string[] | 'all', projectId?: string) {
			const now = new Date().toISOString();
			const targets = app.notifications.all.filter(
				(n) =>
					!n.readAt &&
					(!projectId || n.projectId === projectId) &&
					(ids === 'all' || ids.includes(n.id))
			);
			if (!targets.length) return;
			for (const n of targets) app.notifications.upsert({ ...n, readAt: now });
			void send('notifications.read', { ids: targets.map((n) => n.id) }).catch(() => {});
		}
	};
}
