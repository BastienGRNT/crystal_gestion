<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { Icon, MenuItem } from '../types';
	import Menu from './Menu.svelte';

	interface Props {
		/** What it filters ("Type", "Module"…), read by screen readers. */
		label: string;
		/** The value shown: "Tout", "Bugs", "Louise"… */
		text: string;
		icon?: Icon;
		/** Narrows the list: it stands out, so a hidden card is never a mystery. */
		active: boolean;
		items: (MenuItem | 'separator')[];
		/** Drawn before the text (a module's color, a person's avatar). */
		lead?: Snippet;
	}

	let { label, text, icon: IconComponent, active, items, lead }: Props = $props();
</script>

<!-- One compact button per filter: the board keeps its height for the columns. -->
<Menu {label} {items} placement="bottom-start">
	{#snippet trigger({ props })}
		<button
			{...props}
			title={label}
			class={[
				'inline-flex h-9 max-w-64 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors',
				active
					? 'border-accent/40 bg-accent-soft text-accent-text'
					: 'border-line-strong/70 bg-surface text-ink-2 hover:border-line-strong hover:text-ink'
			]}
		>
			{#if lead}{@render lead()}{:else if IconComponent}<IconComponent
					size={15}
					class="shrink-0"
					aria-hidden="true"
				/>{/if}
			<span class="truncate">{text}</span>
			<ChevronDown size={14} class="shrink-0 opacity-60" aria-hidden="true" />
		</button>
	{/snippet}
</Menu>
