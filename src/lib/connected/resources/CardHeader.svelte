<script lang="ts">
	import { useProject } from '$lib/client/context';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import ConfirmDelete from '$lib/ui/molecules/ConfirmDelete.svelte';

	interface Props {
		title: string;
		ref: string;
		subtitle?: string;
		/** People get a round monogram, things a square one. */
		person?: boolean;
		onrename: (title: string) => void;
		onremove: () => void;
	}

	let { title, ref, subtitle, person = false, onrename, onremove }: Props = $props();
	const { peek } = useProject();
</script>

<header class="flex items-start gap-3">
	<span
		class="flex size-9 shrink-0 items-center justify-center font-display text-2xl uppercase {person
			? 'rounded-full bg-accent-soft text-accent'
			: 'rounded-md bg-sunken text-ink-2'}"
		aria-hidden="true">{title.trim()[0] ?? '?'}</span
	>
	<div class="min-w-0 flex-1">
		<InlineText
			value={title}
			onsave={onrename}
			class="truncate font-display text-2xl leading-tight"
		/>
		<p class="flex min-w-0 items-center gap-2 text-xs text-ink-3">
			<button
				type="button"
				onclick={() => peek(ref)}
				title="Ouvrir le détail"
				class="font-mono text-2xs transition hover:text-accent">{ref}</button
			>
			{#if subtitle}<span class="truncate">{subtitle}</span>{/if}
		</p>
	</div>
	<div class="transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
		<ConfirmDelete onconfirm={onremove} />
	</div>
</header>
