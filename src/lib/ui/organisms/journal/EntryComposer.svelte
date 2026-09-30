<script lang="ts">
	import type { PersonView } from '$lib/client/views/element-view';
	import type { JournalDraft } from '$lib/client/views/journal-draft';
	import type { Suggestion } from '../../types';
	import ComposerFooter from './ComposerFooter.svelte';
	import ComposerHeader from './ComposerHeader.svelte';
	import DecisionInputs from './DecisionInputs.svelte';
	import FixInputs from './FixInputs.svelte';

	interface Props {
		draft: JournalDraft;
		featureOptions: { value: string; label: string }[];
		people: PersonView[];
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		onsubmit: () => void;
		oncancel: () => void;
	}

	let {
		draft = $bindable(),
		featureOptions,
		people,
		suggest,
		onsubmit,
		oncancel
	}: Props = $props();
	const submit = () => draft.title.trim() && onsubmit();
	const PROMPTS = { decision: 'Qu’a-t-on décidé ?', fix: 'Qu’est-ce qui était cassé ?' };
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
	onsubmit={(event) => (event.preventDefault(), submit())}
	onkeydown={(event) => {
		if (event.defaultPrevented) return;
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') submit();
		if (event.key === 'Escape') oncancel();
	}}
	class="animate-rise rounded-xl border border-line-strong bg-surface p-4 shadow-pop sm:p-5"
>
	<ComposerHeader kind={draft.kind} bind:featureId={draft.featureId} {featureOptions} {oncancel} />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={draft.title}
		autofocus
		placeholder={PROMPTS[draft.kind]}
		aria-label="Titre"
		onkeydown={(event) =>
			event.key === 'Enter' &&
			(event.preventDefault(), event.currentTarget.form?.querySelector('textarea')?.focus())}
		class="mt-2 mb-3 w-full bg-transparent font-display text-[28px] leading-tight outline-none placeholder:text-ink-3"
	/>
	{#if draft.kind === 'decision'}<DecisionInputs bind:draft {people} {suggest} />{:else}<FixInputs
			bind:draft
			{suggest}
		/>{/if}
	<ComposerFooter canSave={!!draft.title.trim()} {oncancel} />
</form>
