<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const terms = $derived(
		app.terms.all
			.filter((t) => t.projectId === project.id)
			.sort((a, b) => a.term.localeCompare(b.term, 'fr'))
	);

	/** "Créneau : une plage libre de l'agenda" gives the term and its definition at once. */
	function add(text: string) {
		const [term, ...rest] = text.split(/\s*:\s*/);
		return actions.framing.addTerm(project.id, term, rest.join(' : '));
	}
</script>

<div class="flex flex-col gap-2">
	{#if terms.length}
		<dl
			class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-4 shadow-card"
		>
			{#each terms as term (term.id)}
				<div class="group flex flex-col gap-0 py-2 sm:flex-row sm:gap-4">
					<dt class="sm:w-44 sm:shrink-0">
						<EditableText
							label="Terme"
							value={term.term}
							maxlength={60}
							class="font-semibold"
							onsave={(value) => actions.framing.updateTerm(term.id, { term: value })}
						/>
					</dt>
					<dd class="flex min-w-0 flex-1 items-start gap-1">
						<EditableText
							label="Définition"
							value={term.definition}
							placeholder="Sa définition, dans les mots du métier"
							allowEmpty
							maxlength={600}
							class="flex-1 text-ink-2"
							onsave={(definition) => actions.framing.updateTerm(term.id, { definition })}
						/>
						<IconButton
							icon={Trash2}
							size="sm"
							label="Retirer {term.term}"
							class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
							onclick={() => actions.framing.removeTerm(term)}
						/>
					</dd>
				</div>
			{/each}
		</dl>
	{/if}
	<InlineAdd
		label="Ajouter un terme"
		placeholder="Terme : définition (ex. : Créneau : une plage libre de l’agenda)"
		onadd={add}
	/>
</div>
