import type { AppState } from '$lib/client/state/app.svelte';
import { firstName } from '$lib/client/format';
import { now } from '$lib/client/now.svelte';
import { deadlineRisk } from '$lib/client/views/forecast';
import { waitingOn } from '$lib/client/views/questions';
import { threadOf } from '$lib/client/views/workspace';
import type { Task } from '$lib/modules/tasks/domain/task';

/** Is this deadline going to hold? Read from the planning, the questions and the board. */
export const riskOf = (app: AppState, task: Task) =>
	deadlineRisk(task, {
		today: now.today,
		now: now.value,
		slots: app.slots.all,
		waitingOn: waitingOn(app.questions.all, threadOf(app.channels.all, task.id)?.id),
		meId: app.meId,
		nameOf: (id) => firstName(app.users.get(id)?.name ?? 'quelqu’un')
	});
