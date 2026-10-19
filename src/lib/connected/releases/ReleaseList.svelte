<script lang="ts">
	import { ChevronDown, Copy } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, shortDay } from '$lib/client/format';
	import { toasts } from '$lib/client/toasts.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import RichText from '$lib/ui/organisms/RichText.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();
	let open = $state<string | null>(null);

	const releases = $derived(
		app.releases.all
			.filter((r) => r.projectId === project.id)
			.sort((a, b) => b.shippedAt.localeCompare(a.shippedAt))
	);
	const count = (id: string) => app.tasks.all.filter((t) => t.releaseId === id).length;

	async function copy(text: string) {
		await navigator.clipboard.writeText(text).catch(() => {});
		toasts.show('Copié', { tone: 'success', duration: 1500 });
	}
</script>

<section aria-labelledby="history" class="flex flex-col gap-3">
	<h2 id="history" class="text-lg font-semibold tracking-tight">Déjà en prod</h2>
	{#if releases.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface shadow-card"
		>
			{#each releases as release, i (release.id)}
				{@const expanded = open === release.id || (open === null && i === 0)}
				<li class="flex flex-col gap-3 px-4 py-3">
					<button
						class="flex min-h-10 items-center gap-3 text-left"
						aria-expanded={expanded}
						onclick={() => (open = expanded ? '' : release.id)}
					>
						<span class="font-semibold">{release.name}</span>
						<span class="text-sm text-ink-3"
							>{shortDay(release.shippedAt.slice(0, 10))} · {count(release.id)} tâche{count(
								release.id
							) > 1
								? 's'
								: ''} · {firstName(app.users.get(release.createdBy)?.name ?? '')}</span
						>
						<ChevronDown
							size={16}
							class={['ml-auto text-ink-3 transition-transform', expanded && 'rotate-180']}
						/>
					</button>
					{#if expanded}
						<RichText body={release.changelog.replace(/^# .*\n+/, '')} size="base" />
						<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
							{#if release.notes}
								<button
									class="inline-flex h-10 items-center gap-1.5 font-medium text-ink-2 hover:text-accent-text"
									onclick={() => copy(release.notes)}
									><Copy size={14} />Copier la note client</button
								>
							{/if}
							<button
								class="inline-flex h-10 items-center gap-1.5 font-medium text-ink-2 hover:text-accent-text"
								onclick={() => copy(release.changelog)}
								><Copy size={14} />Copier le changelog</button
							>
							<button
								class="ml-auto h-10 font-medium text-ink-3 hover:text-danger-text"
								onclick={() => actions.roadmap.removeRelease(release)}
								>Annuler cette mise en prod</button
							>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-base text-ink-3">
			Aucune version pour l’instant. La première mise en prod s’appellera v1.0 (tu peux changer).
		</p>
	{/if}
</section>
