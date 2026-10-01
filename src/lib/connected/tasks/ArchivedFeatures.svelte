<script lang="ts">
	import { ArchiveRestore } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import type { Feature } from '$lib/modules/features/domain/feature';
	import GroupHeader from '$lib/ui/organisms/tasks/GroupHeader.svelte';

	/** Finished features: out of the way, still there to read back. */
	let { features }: { features: Feature[] } = $props();
	const { store, actions } = useProject();
	let open = $state(false);
</script>

<section class="mb-5">
	<GroupHeader
		title="Archivées"
		meta="{features.length} feature{features.length > 1 ? 's' : ''} terminée{features.length > 1
			? 's'
			: ''}"
		{open}
		ontoggle={() => (open = !open)}
	/>
	{#if open}
		<div class="pt-1">
			{#each features as feature (feature.id)}
				<div
					class="group relative flex min-h-10 items-center gap-2.5 rounded-lg pr-1 pl-2 hover:bg-hover"
				>
					<a
						href="/p/{store.project.slug}/features/{feature.ref}"
						class="min-w-0 flex-1 truncate text-sm text-ink-2 after:absolute after:inset-0"
						>{feature.title}</a
					>
					<span class="text-xs text-ink-3"
						>archivée le {formatDay(feature.archivedAt!, { day: 'numeric', month: 'short' })}</span
					>
					<button
						type="button"
						onclick={() => actions.features.archive(feature.id, false)}
						class="relative inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-2 opacity-0 group-hover:opacity-100 hover:bg-sunken"
						><ArchiveRestore size={13} />Restaurer</button
					>
				</div>
			{/each}
		</div>
	{/if}
</section>
