<script lang="ts" generics="K extends string">
	import type { Component } from 'svelte';

	interface Props {
		kinds: readonly { value: K; label: string; key: string; icon: Component<{ size?: number }> }[];
		value: K;
		onchange: (kind: K) => void;
	}

	let { kinds, value, onchange }: Props = $props();
</script>

<div class="flex gap-0.5 overflow-x-auto rounded-[9px] bg-sunken p-[3px]" role="tablist">
	{#each kinds as kind (kind.value)}
		<button
			type="button"
			role="tab"
			aria-selected={kind.value === value}
			title="Raccourci : {kind.key}"
			onclick={() => onchange(kind.value)}
			class="inline-flex h-[30px] flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2 text-xs font-medium whitespace-nowrap transition {kind.value ===
			value
				? 'bg-panel text-ink shadow-sm'
				: 'text-ink-3 hover:text-ink'}"
		>
			<kind.icon size={14} />{kind.label}
		</button>
	{/each}
</div>
