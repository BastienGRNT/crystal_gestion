<script lang="ts">
	import Avatar from '../../atoms/Avatar.svelte';
	import type { TokenSuggestion } from '../../types';

	interface Props {
		value: string;
		placeholder: string;
		/** What `@an` or `#bou` can become; empty when nothing matches. */
		suggest: (sigil: '@' | '#', word: string) => TokenSuggestion[];
		onsubmit: () => void;
	}

	let { value = $bindable(), placeholder, suggest, onsubmit }: Props = $props();
	let input: HTMLInputElement;
	let token = $state<{ sigil: '@' | '#'; word: string; start: number } | null>(null);
	let cursor = $state(0);
	const options = $derived(token ? suggest(token.sigil, token.word).slice(0, 6) : []);

	function track() {
		const before = value.slice(0, input.selectionStart ?? value.length);
		const match = before.match(/(^|\s)([@#])([\p{L}\d-]*)$/u);
		token = match
			? { sigil: match[2] as '@' | '#', word: match[3], start: before.length - match[3].length - 1 }
			: null;
		cursor = 0;
	}

	function complete(option: TokenSuggestion) {
		if (!token) return;
		const end = token.start + 1 + token.word.length;
		value = `${value.slice(0, token.start)}${token.sigil}${option.insert} ${value.slice(end).trimStart()}`;
		token = null;
		input.focus();
	}

	function onkeydown(event: KeyboardEvent) {
		if (options.length && (event.key === 'Tab' || event.key === 'Enter')) {
			event.preventDefault();
			complete(options[cursor]);
		} else if (options.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			event.preventDefault();
			cursor = (cursor + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
		} else if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onsubmit();
		}
	}
</script>

<div class="relative">
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:this={input}
		bind:value
		name="title"
		autofocus
		autocomplete="off"
		{placeholder}
		oninput={track}
		onclick={track}
		{onkeydown}
		onblur={() => setTimeout(() => (token = null), 120)}
		class="w-full bg-transparent py-1 text-xl font-medium tracking-[-0.01em] outline-none placeholder:text-ink-3"
	/>
	{#if options.length}
		<div
			class="absolute top-full left-0 z-10 mt-1 w-64 animate-rise rounded-[10px] border border-line bg-panel p-1 shadow-pop"
			role="listbox"
		>
			{#each options as option, i (option.insert)}
				<button
					type="button"
					role="option"
					aria-selected={i === cursor}
					onmousedown={(event) => (event.preventDefault(), complete(option))}
					class="flex h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-ui {i ===
					cursor
						? 'bg-hover'
						: ''}"
				>
					{#if option.person}<Avatar
							name={option.person.name}
							color={option.person.color}
							size={18}
						/>
					{:else if option.square}<span
							class="size-2.5 rounded-[3px]"
							style="background:{option.square}"
						></span>{/if}
					<span class="truncate">{option.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
