<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { quadrantOf } from '$lib/modules/tasks/domain/eisenhower';

	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const hour = new Date().getHours();
	const hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir';
	const urgent = $derived(
		store.tasks.items.filter((t) => t.status !== 'done' && t.assigneeIds.includes(me.id) && quadrantOf(t, sources.priorityOf(t.featureId), new Date()) === 'do').length
	);
	const questions = $derived(store.questions.items.filter((q) => q.userId === me.id && !q.resolvedAt).length);
	const others = $derived(store.members.items.filter((m) => m.id !== me.id && store.online.includes(m.id)).map((m) => m.name));
	const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
	const summary = $derived(
		[
			urgent ? `${plural(urgent, 'tâche')} à faire maintenant` : 'rien d’urgent',
			questions ? `${plural(questions, 'question')} pour toi` : null,
			others.length ? `${others.join(' et ')} ${others.length > 1 ? 'sont' : 'est'} en ligne` : null
		].filter(Boolean).join(' · ')
	);
</script>

<header class="mb-10">
	<p class="mb-3 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">{formatDay(new Date())}</p>
	<h1 class="font-display text-[52px] leading-[0.95] sm:text-[68px]">{hello}, <em class="text-accent">{me.name}</em>.</h1>
	<p class="mt-3 text-[15px] text-ink-2 first-letter:uppercase">{summary}.</p>
</header>
