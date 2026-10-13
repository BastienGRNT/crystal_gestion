import {
	copiedWeek,
	type AvailabilitySlot,
	type AvailabilityStatus,
	type WorkBlock
} from '$lib/modules/planning/domain/availability';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { toasts } from '../toasts.svelte';
import { settle } from './optimistic';

type Range = { startsAt: string; endsAt: string };

export function planningActions(app: AppState) {
	return {
		createSlot(range: Range, status: AvailabilityStatus = 'available') {
			const slot: AvailabilitySlot = {
				id: crypto.randomUUID(),
				userId: app.meId,
				...range,
				status
			};
			app.slots.upsert(slot);
			settle(
				app,
				slot.id,
				send('slots.create', slot),
				(s) => app.slots.upsert(s),
				() => app.slots.remove(slot.id)
			);
		},

		updateSlot(id: string, patch: Partial<Range> & { status?: AvailabilityStatus }) {
			const current = app.slots.get(id);
			if (!current) return;
			app.slots.upsert({ ...current, ...patch });
			settle(
				app,
				id,
				send('slots.update', { id, ...patch }),
				(s) => app.slots.upsert(s),
				() => app.slots.upsert(current)
			);
		},

		removeSlot(id: string) {
			const current = app.slots.get(id);
			if (!current) return;
			app.slots.remove(id);
			settle(
				app,
				id,
				send('slots.delete', { id }),
				() => {},
				() => app.slots.upsert(current)
			);
		},

		/** Pre-fills the shown week with the previous one. */
		async copyWeek(from: Date, to: Date) {
			const mine = app.slots.all.filter((s) => s.userId === app.meId);
			const copies = copiedWeek(mine, from, to).map((s) => ({ ...s, id: crypto.randomUUID() }));
			if (!copies.length)
				return toasts.show('Rien à copier : la semaine d’avant est vide (ou déjà recopiée).');
			copies.forEach((s) => app.slots.upsert(s));
			try {
				await send('slots.createMany', {
					slots: copies.map(({ id, startsAt, endsAt, status }) => ({
						id,
						startsAt,
						endsAt,
						status
					}))
				});
				toasts.show(
					`${copies.length} créneau${copies.length > 1 ? 'x' : ''} recopié${copies.length > 1 ? 's' : ''}`,
					{ tone: 'success' }
				);
			} catch (error) {
				copies.forEach((s) => app.slots.remove(s.id));
				toasts.error(errorMessage(error));
			}
		},

		createBlock(projectId: string, range: Range, taskId: string | null = null) {
			const block: WorkBlock = {
				id: crypto.randomUUID(),
				projectId,
				userId: app.meId,
				taskId,
				...range
			};
			app.blocks.upsert(block);
			settle(
				app,
				block.id,
				send('blocks.create', block),
				(b) => app.blocks.upsert(b),
				() => app.blocks.remove(block.id)
			);
			return block;
		},

		updateBlock(id: string, patch: Partial<Range> & { taskId?: string | null }) {
			const current = app.blocks.get(id);
			if (!current) return;
			app.blocks.upsert({ ...current, ...patch });
			settle(
				app,
				id,
				send('blocks.update', { id, ...patch }),
				(b) => app.blocks.upsert(b),
				() => app.blocks.upsert(current)
			);
		},

		removeBlock(id: string) {
			const current = app.blocks.get(id);
			if (!current) return;
			app.blocks.remove(id);
			settle(
				app,
				id,
				send('blocks.delete', { id }),
				() => {},
				() => app.blocks.upsert(current)
			);
		}
	};
}
