<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import type { Suggestion } from '../types';
	import SuggestionList from './SuggestionList.svelte';
	import { findTrigger, insertAt, type Trigger } from './trigger';

	interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
		value: string;
		/** Returns suggestions for "#query" (elements) or "@query" (people). */
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		onsubmit?: () => void;
		/** Escape pressed while no suggestion list is open. */
		oncancel?: () => void;
		element?: HTMLTextAreaElement;
		/** Where suggestions open; "above" for fields docked at the bottom of the screen. */
		suggestions?: 'below' | 'above';
	}

	let {
		value = $bindable(),
		suggest,
		onsubmit,
		oncancel,
		element = $bindable(),
		suggestions = 'below',
		class: extra = '',
		...rest
	}: Props = $props();
	let trigger = $state<Trigger | null>(null);
	let highlighted = $state(0);
	const items = $derived(trigger ? suggest(trigger.symbol, trigger.query) : []);

	function refresh() {
		trigger = element ? findTrigger(value, element.selectionStart) : null;
		highlighted = 0;
	}

	function pick(item: Suggestion) {
		if (!trigger || !element) return;
		const next = insertAt(value, trigger, element.selectionStart, item.insert);
		value = next.text;
		trigger = null;
		requestAnimationFrame(() => element?.setSelectionRange(next.caret, next.caret));
	}

	function onkeydown(event: KeyboardEvent) {
		if (trigger && items.length) {
			const moves: Record<string, () => void> = {
				ArrowDown: () => (highlighted = (highlighted + 1) % items.length),
				ArrowUp: () => (highlighted = (highlighted - 1 + items.length) % items.length),
				Enter: () => pick(items[highlighted]),
				Tab: () => pick(items[highlighted]),
				Escape: () => (trigger = null)
			};
			if (moves[event.key]) return (event.preventDefault(), moves[event.key]());
		}
		if (oncancel && event.key === 'Escape') return oncancel();
		if (onsubmit && event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onsubmit();
		}
	}
</script>

<div class="relative">
	<textarea
		bind:this={element}
		bind:value
		oninput={refresh}
		onclick={refresh}
		{onkeydown}
		onblur={() => setTimeout(() => (trigger = null), 120)}
		class="field-sizing-content w-full resize-none bg-transparent outline-none placeholder:text-ink-3 {extra}"
		{...rest}></textarea>
	{#if trigger}<SuggestionList {items} {highlighted} onpick={pick} placement={suggestions} />{/if}
</div>
