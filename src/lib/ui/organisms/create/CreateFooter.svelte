<script lang="ts">
	import { Check } from '@lucide/svelte';

	interface Props {
		again: boolean;
		label: string;
		disabled: boolean;
		onagain: () => void;
		onsubmit: () => void;
	}

	let { again, label, disabled, onagain, onsubmit }: Props = $props();
</script>

<div class="flex items-center gap-2.5 border-t border-line bg-sunken py-3 pr-3.5 pl-[18px]">
	<button type="button" onclick={onagain} class="flex items-center gap-2 text-xs text-ink-2">
		<span
			class="flex size-4 items-center justify-center rounded border-[1.5px] text-white {again
				? 'border-accent bg-accent'
				: 'border-line-strong'}"><Check size={11} strokeWidth={3} /></span
		>
		Enchaîner (en créer un autre)
	</button>
	<span class="flex-1"></span>
	<span class="hidden text-xs text-ink-3 sm:inline">Échap pour fermer</span>
	<button
		type="button"
		onclick={onsubmit}
		{disabled}
		class="inline-flex h-[34px] items-center gap-2 rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-ink transition disabled:opacity-50"
	>
		Créer {label}<span class="font-mono text-2xs opacity-80">↵</span>
	</button>
</div>
