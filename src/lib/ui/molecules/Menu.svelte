<script lang="ts">
	import { Check } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import Kbd from '../atoms/Kbd.svelte';
	import type { MenuItem, Placement } from '../types';
	import Popover from './Popover.svelte';

	interface Props {
		items: (MenuItem | 'separator')[];
		placement?: Placement;
		label: string;
		/** The trigger; spread `props` on the button that opens the menu. */
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
	}

	let { items, placement = 'bottom-end', label, trigger }: Props = $props();
	let open = $state(false);
	let anchor = $state<HTMLElement>();
	let closedAt = 0;

	$effect(() => {
		if (!open) closedAt = performance.now();
	});

	const triggerProps = $derived({
		'aria-haspopup': 'menu',
		'aria-expanded': open,
		'aria-label': label,
		onclick: (event: MouseEvent) => {
			event.stopPropagation();
			anchor = event.currentTarget as HTMLElement;
			// The popover closes itself on the press that reaches the trigger: don't reopen it.
			if (performance.now() - closedAt < 250) return;
			open = !open;
		}
	});

	function focusNext(event: KeyboardEvent) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		const buttons = [
			...(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>(
				'button:not(:disabled)'
			)
		];
		const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
		const next =
			event.key === 'ArrowDown'
				? (at + 1) % buttons.length
				: (at - 1 + buttons.length) % buttons.length;
		buttons[next]?.focus();
	}
</script>

{@render trigger({ props: triggerProps })}

<Popover bind:open {anchor} {placement} {label} class="min-w-52">
	<div role="menu" tabindex="-1" onkeydown={focusNext}>
		{#each items as item, i (i)}
			{#if item === 'separator'}
				<div class="my-1 h-px bg-line" role="separator"></div>
			{:else}
				<button
					role="menuitem"
					disabled={item.disabled}
					class={[
						'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base transition-colors disabled:opacity-40',
						item.danger ? 'text-danger-text hover:bg-danger-soft' : 'hover:bg-hover'
					]}
					onclick={() => {
						open = false;
						item.run();
					}}
				>
					{#if item.icon}<item.icon size={16} class="shrink-0 opacity-75" aria-hidden="true" />{/if}
					<span class="flex-1">{item.label}</span>
					{#if item.checked}<Check
							size={16}
							class="shrink-0 text-accent-text"
							aria-label="choisi"
						/>{/if}
					{#if item.shortcut}<Kbd keys={item.shortcut} />{/if}
				</button>
			{/if}
		{/each}
	</div>
</Popover>
