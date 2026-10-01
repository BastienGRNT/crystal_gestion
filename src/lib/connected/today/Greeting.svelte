<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import { quadrantOf } from '$lib/modules/tasks/domain/eisenhower';
	import { isActive } from '$lib/modules/tasks/domain/task';
	import Dot from '$lib/ui/atoms/Dot.svelte';

	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const base = $derived(`/p/${store.project.slug}`);
	const hour = new Date().getHours();
	const hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir';
	const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;
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
	const ideas = $derived(store.ideas.items.filter(needsTriage).length);
	const online = $derived(
		store.members.items.filter((m) => m.id !== me.id && store.online.includes(m.id))
	);
	const chips = $derived([
		...online.map((m) => ({
			key: m.id,
			color: 'var(--success)',
			text: `${m.name} est en ligne`,
			href: `${base}/discussion`
		})),
		{
			key: 'do',
			color: 'var(--must)',
			text: `${urgent} à faire maintenant`,
			href: `${base}/tasks`
		},
		{
			key: 'q',
			color: 'var(--should)',
			text: `${plural(questions, 'question')} pour toi`,
			href: `${base}/discussion`
		},
		{
			key: 'i',
			color: 'var(--accent)',
			text: `${plural(ideas, 'idée')} à trier`,
			href: `${base}/ideas`
		}
	]);
</script>

<div>
	<h2 class="text-2xl font-semibold tracking-[-0.02em]">{hello} {me.name}</h2>
	<div class="mt-2.5 flex flex-wrap gap-1.5">
		{#each chips as chip (chip.key)}
			<a
				href={chip.href}
				class="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-sunken px-2.5 text-xs text-ink-2 hover:text-ink hover:no-underline"
				><Dot color={chip.color} />{chip.text}</a
			>
		{/each}
	</div>
</div>
