<script lang="ts">
	import type { CreateKind } from '$lib/client/create-kinds';

	let { kind, value = $bindable() }: { kind: CreateKind; value: string } = $props();
	const PLACEHOLDERS: Record<CreateKind, string> = {
		task: 'Détails (facultatif)',
		bug: 'Comment le reproduire ? (facultatif)',
		feature:
			'Découpe-la en tâches, une par ligne :\nMaquette de la page\nBrancher l’API\nTester sur mobile',
		idea: 'Une note pour plus tard (facultatif)',
		decision: 'Pourquoi ? La raison en une ou deux phrases'
	};
	const rows = $derived(kind === 'feature' ? 4 : 2);
</script>

<div class="px-5 pb-3">
	<textarea
		bind:value
		{rows}
		placeholder={PLACEHOLDERS[kind]}
		class="w-full resize-none bg-transparent text-sm leading-relaxed text-ink-2 outline-none placeholder:text-ink-3 {kind ===
		'feature'
			? 'rounded-lg border border-dashed border-line-strong px-3 py-2'
			: ''}"></textarea>
</div>
