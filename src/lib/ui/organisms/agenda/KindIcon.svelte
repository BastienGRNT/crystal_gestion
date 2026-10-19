<script lang="ts">
	import { Briefcase, Bug, Sparkles, Wrench } from '@lucide/svelte';
	import type { TaskKind } from '$lib/modules/tasks/domain/task';

	let {
		kind,
		critical = false,
		size = 15
	}: { kind: TaskKind; critical?: boolean; size?: number } = $props();
	const ICONS = { feature: Sparkles, bug: Bug, tech: Wrench, action: Briefcase };
	const WORDS = {
		feature: 'Fonctionnalité',
		bug: 'Bug',
		tech: 'Technique',
		action: 'Action'
	};
	const Icon = $derived(ICONS[kind]);
</script>

<span
	class="inline-flex shrink-0 {critical ? 'text-danger-text' : 'text-ink-3'}"
	title={critical ? 'Bug bloquant' : WORDS[kind]}
>
	<Icon {size} aria-hidden="true" />
	<span class="sr-only">{critical ? 'Bug bloquant' : WORDS[kind]}</span>
</span>
