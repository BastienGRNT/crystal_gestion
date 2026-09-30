<script lang="ts">
	import { goto } from '$app/navigation';
	import { Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import ProgressBar from '$lib/ui/atoms/ProgressBar.svelte';
	import AssigneePicker from '$lib/ui/molecules/AssigneePicker.svelte';
	import ConfirmButton from '$lib/ui/molecules/ConfirmButton.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import PriorityMenu from '$lib/ui/molecules/PriorityMenu.svelte';

	let { feature }: { feature: Feature } = $props();
	const { store, actions } = useProject();
	const progress = $derived(progressOf(store.tasks.items.filter((task) => task.featureId === feature.id)));

	function remove() {
		actions.features.remove(feature.id);
		goto(`/p/${store.project.slug}/project`);
	}
</script>

<header class="mb-10">
	<div class="mb-4 flex items-center gap-3 text-[12.5px] text-ink-3">
		<a href="/p/{store.project.slug}/project" class="hover:text-ink">Features</a> /
		<span class="font-mono">{feature.ref}</span>
		<PriorityMenu priority={feature.priority} onchange={(priority) => actions.features.update(feature.id, { priority })} />
		<span class="ml-auto"><ConfirmButton onconfirm={remove}><Trash2 size={13} /> Supprimer</ConfirmButton></span>
	</div>
	<InlineText value={feature.title} onsave={(title) => actions.features.update(feature.id, { title })} class="font-display text-[46px] leading-[1.02] sm:text-[58px]" />
	<div class="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
		<span class="flex items-center gap-2 text-[13px] text-ink-3">Responsable
			<AssigneePicker people={store.members.items} selected={feature.ownerId ? [feature.ownerId] : []} onchange={(ids) => actions.features.update(feature.id, { ownerId: ids.at(-1) ?? null })} />
		</span>
		<span class="flex min-w-60 flex-1 items-center gap-3 text-[13px] text-ink-3">
			Avancement <span class="max-w-72 flex-1"><ProgressBar ratio={progress.ratio} label="Avancement" /></span>
			<span class="font-mono text-[12px]">{progress.done}/{progress.total}</span>
		</span>
	</div>
</header>
