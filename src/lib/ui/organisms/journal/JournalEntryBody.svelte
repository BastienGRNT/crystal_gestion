<script lang="ts">
	import { formatDueDate } from '$lib/client/format';
	import type { JournalBody } from '$lib/client/views/journal-entry';
	import AvatarStack from '../../molecules/AvatarStack.svelte';
	import FieldNote from '../../molecules/FieldNote.svelte';
	import type { RefView } from '../../types';

	interface Props {
		body: JournalBody;
		resolve: (ref: string) => RefView | undefined;
		personName: (userId: string) => string | undefined;
	}

	let { body, resolve, personName }: Props = $props();
	const fixNotes = $derived(
		body.kind === 'fix'
			? [
					{ label: 'Problème', text: body.problem },
					{ label: 'Cause', text: body.cause },
					{ label: 'Solution', text: body.solution }
				].filter((note) => note.text)
			: []
	);
</script>

{#if body.kind === 'decision'}
	{#if body.rationale}<FieldNote
			label="Pourquoi"
			text={body.rationale}
			{resolve}
			{personName}
		/>{/if}
	{#if body.decidedBy.length || body.decidedOn}
		<p class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-3">
			{#if body.decidedBy.length}
				<span class="flex items-center gap-1.5">
					<AvatarStack people={body.decidedBy} size={18} />
					<span class="text-ink-2">{body.decidedBy.map((p) => p.name).join(', ')}</span>
				</span>
			{/if}
			{#if body.decidedOn}<span
					>décidé le <span class="text-ink-2">{formatDueDate(body.decidedOn)}</span></span
				>{/if}
		</p>
	{/if}
{:else if body.kind === 'fix'}
	{#if fixNotes.length}
		<div class="grid gap-x-6 gap-y-2.5 sm:grid-cols-3">
			{#each fixNotes as note (note.label)}<FieldNote {...note} {resolve} {personName} />{/each}
		</div>
	{/if}
{/if}
