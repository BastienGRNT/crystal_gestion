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
		copyWeek(from: Date, to: Date) {
			const mine = app.slots.all.filter((s) => s.userId === app.meId);
			const copies = copiedWeek(mine, from, to);
			if (!copies.length)
				return toasts.show('Rien à copier : la semaine d’avant est vide (ou déjà recopiée).');
			return this.createSlots(
				copies,
				`${copies.length} créneau${copies.length > 1 ? 'x' : ''} recopié${copies.length > 1 ? 's' : ''}`
			);
		},

		/** Several slots at once, said in one toast (none when `done` is empty). True once saved. */
		async createSlots(
			ranges: (Range & { id?: string; status?: AvailabilityStatus })[],
			done: string
		): Promise<boolean> {
			const slots: AvailabilitySlot[] = ranges.map((range) => ({
				id: range.id ?? crypto.randomUUID(),
				userId: app.meId,
				startsAt: range.startsAt,
				endsAt: range.endsAt,
				status: range.status ?? 'available'
			}));
			slots.forEach((s) => app.slots.upsert(s));
			try {
				await send('slots.createMany', {
					slots: slots.map(({ id, startsAt, endsAt, status }) => ({ id, startsAt, endsAt, status }))
				});
				if (done) toasts.show(done, { tone: 'success' });
				return true;
			} catch (error) {
				slots.forEach((s) => app.slots.remove(s.id));
				toasts.error(errorMessage(error));
				return false;
			}
		},

		createBlock(projectId: string, range: Range, taskId: string | null = null) {
			return this.planBlock(projectId, range, taskId).block;
		},

		/** A block shown at once; `saved` settles when the server has answered. */
		planBlock(projectId: string, range: Range, taskId: string | null = null) {
			const block: WorkBlock = {
				id: crypto.randomUUID(),
				projectId,
				userId: app.meId,
				taskId,
				startsAt: range.startsAt,
				endsAt: range.endsAt
			};
			app.blocks.upsert(block);
			const saved = settle(
				app,
				block.id,
				send('blocks.create', block),
				(b) => app.blocks.upsert(b),
				() => app.blocks.remove(block.id)
			);
			return { block, saved };
		},

		/**
		 * Tasks laid in the agenda in one go, said in a toast with "Annuler". Undoing waits for the
		 * creations to land, so a quick click never leaves a block behind on the server.
		 */
		placeTasks(projectId: string, placements: (Range & { taskId: string })[], done: string) {
			const planned = placements.map((p) => this.planBlock(projectId, p, p.taskId));
			toasts.show(done, {
				tone: 'success',
				duration: 6000,
				action: {
					label: 'Annuler',
					run: async () => {
						await Promise.all(planned.map((p) => p.saved));
						planned.forEach((p) => this.removeBlock(p.block.id));
					}
				}
			});
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
