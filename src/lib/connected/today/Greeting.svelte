<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { daysUntil, toDateKey } from '$lib/modules/kernel/domain/dates';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { quadrantOf } from '$lib/modules/tasks/domain/eisenhower';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import ReviewMenu from './ReviewMenu.svelte';

	/** One sentence that says what matters before reading anything else. */
	let { recapSince }: { recapSince: string | null } = $props();
	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const hour = new Date().getHours();
	const hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir';
	const plural = (n: number, one: string, many: string) =>
		(n > 1 ? many : one).replace('{n}', `${n}`);
	const away = $derived(recapSince ? -daysUntil(toDateKey(new Date(recapSince)), new Date()) : 0);
	const urgent = $derived(
		store.tasks.items.filter(
			(t) =>
				isActive(t) &&
				t.assigneeIds.includes(me.id) &&
				quadrantOf(t, sources.priorityOf(t.featureId), new Date()) === 'do'
		).length
	);
	const questions = $derived(
		store.questions.items.filter((q) => q.userId === me.id && !q.resolvedAt).length
	);
	const sentence = $derived(
		[
			away >= 2 ? `Ta dernière visite remonte à ${away} jours.` : null,
			questions ? plural(questions, '1 question t’attend.', '{n} questions t’attendent.') : null,
			urgent
				? plural(urgent, '1 tâche est à faire maintenant.', '{n} tâches sont à faire maintenant.')
				: 'Rien d’urgent pour toi.'
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<div class="flex flex-wrap items-end gap-x-6 gap-y-3">
	<div class="min-w-0 flex-1">
		<h2 class="text-2xl font-semibold tracking-[-0.02em]">{hello} {me.name}</h2>
		<p class="mt-1 text-base text-ink-2">{sentence}</p>
	</div>
	<ReviewMenu />
</div>
