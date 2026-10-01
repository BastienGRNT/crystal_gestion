<script lang="ts">
	import { Lightbulb } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { isOpen } from '$lib/modules/ideas/domain/idea';
	import AddLine from '$lib/ui/molecules/AddLine.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import IdeaList from '../ideas/IdeaList.svelte';

	/** Ideas outside the product: someone to call, a lead to follow. */
	const { store, actions } = useProject();
	const ideas = $derived(store.ideas.items.filter(isOpen));
</script>

<p class="mb-4 max-w-[70ch] text-base text-ink-2">
	Hors produit : quelqu’un à contacter, une piste à creuser. Une idée de Feat va dans l’<strong
		>Icebox</strong
	> (onglet Liste). Une idée peut devenir une Task ou une Feat d’un clic.
</p>
<section class="overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface">
	<div class="divide-y-[1.5px] divide-line/70">
		<AddLine
			row
			label="Noter une idée"
			placeholder="Ex. Contacter Intel pour présenter l’app"
			onadd={(title) => actions.ideas.create({ title })}
		/>
		<IdeaList {ideas} />
	</div>
</section>
{#if !ideas.length}
	<div class="mt-8">
		<EmptyState
			icon={Lightbulb}
			title="Aucune idée en attente"
			text="Note-la au-dessus en une phrase, tu la retrouveras ici."
		/>
	</div>
{/if}
