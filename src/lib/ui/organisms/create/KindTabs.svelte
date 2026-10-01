<script lang="ts" generics="K extends string">
	import type { Component } from 'svelte';

	interface Props {
		kinds: readonly { value: K; label: string; key: string; icon: Component<{ size?: number }> }[];
		value: K;
		onchange: (kind: K) => void;
	}

	let { kinds, value, onchange }: Props = $props();
</script>

<div class="flex gap-1 overflow-x-auto border-b border-line px-3" role="tablist">
	{#each kinds as kind (kind.value)}
		<button
			type="button"
			role="tab"
			aria-selected={kind.value === value}
			title="Raccourci : {kind.key}"
			onclick={() => onchange(kind.value)}
			class="-mb-px inline-flex h-11 items-center gap-2 border-b-2 px-2.5 text-ui font-medium whitespace-nowrap transition {kind.value ===
			value
				? 'border-accent text-ink'
				: 'border-transparent text-ink-3 hover:text-ink'}"
		>
			<kind.icon size={15} />{kind.label}
		</button>
	{/each}
</div>
