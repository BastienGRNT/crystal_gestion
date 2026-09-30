<script lang="ts">
	import type { RefView, Suggestion } from '../types';
	import RefTextArea from './RefTextArea.svelte';
	import RichText from './RichText.svelte';

	interface Props {
		value: string;
		onsave: (value: string) => void;
		resolve: (ref: string) => RefView | undefined;
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		placeholder?: string;
		class?: string;
	}

	let {
		value,
		onsave,
		resolve,
		suggest,
		placeholder = 'Ajouter…',
		class: extra = ''
	}: Props = $props();
	let draft = $state('');
	let editing = $state(false);
	let element = $state<HTMLTextAreaElement>();

	function start(event: MouseEvent) {
		if ((event.target as HTMLElement).closest('a')) return;
		draft = value;
		editing = true;
		requestAnimationFrame(() => element?.focus());
	}

	function commit() {
		editing = false;
		if (draft !== value) onsave(draft.trim());
	}
</script>

{#if editing}
	<div class="rounded-md bg-sunken/50 px-2 py-1.5 ring-2 ring-accent/30">
		<RefTextArea
			bind:value={draft}
			bind:element
			{suggest}
			onblur={commit}
			{placeholder}
			class="min-h-16 {extra}"
		/>
		<p class="mt-1 text-[11px] text-ink-3">
			# pour lier un élément · clique ailleurs pour enregistrer
		</p>
	</div>
{:else}
	<div
		role="button"
		tabindex="0"
		onclick={start}
		onkeydown={(e) => e.key === 'Enter' && start(e as unknown as MouseEvent)}
		class="-mx-2 cursor-text rounded-md px-2 py-1.5 transition hover:bg-sunken/50 {extra}"
	>
		{#if value}<RichText text={value} {resolve} />{:else}<span class="text-ink-3"
				>{placeholder}</span
			>{/if}
	</div>
{/if}
