<script lang="ts">
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import Avatar from '../../atoms/Avatar.svelte';

	type Row = { key: string; label: string; minutes: number; color: string };
	interface Props {
		period: string;
		total: number;
		byFeature: Row[];
		/** Only shown for the team view. */
		byPerson: Row[] | null;
	}

	let { period, total, byFeature, byPerson }: Props = $props();
	const share = (minutes: number) =>
		`${Math.max(4, Math.round((minutes / Math.max(total, 1)) * 100))}%`;
</script>

<section
	class="rounded-[18px] border-[1.5px] border-line bg-surface p-4 shadow-card"
	aria-label="Temps passé"
>
	<p class="text-2xs font-semibold tracking-[0.08em] text-ink-3 uppercase">
		Temps passé · {period}
	</p>
	<p class="mt-1 font-display text-4xl">{total ? formatMinutes(total) : '0 min'}</p>
	{#if byFeature.length}
		<h3 class="mt-4 mb-2 text-sm font-semibold">Par Feat</h3>
		<ul class="flex flex-col gap-2.5">
			{#each byFeature as row (row.key)}
				<li>
					<p class="flex items-center gap-2 text-sm">
						<span class="size-3 shrink-0 rounded-[4px]" style="background:{row.color}"></span>
						<span class="min-w-0 flex-1 truncate">{row.label}</span>
						<span class="font-mono text-xs text-ink-2">{formatMinutes(row.minutes)}</span>
					</p>
					<span
						class="mt-1 block h-1.5 rounded-full"
						style="width:{share(row.minutes)};background:{row.color}"
					></span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-3 text-sm text-ink-2">
			Rien d’enregistré sur cette période. Démarre un chrono depuis une tâche, ou choisis « Temps
			passé » puis glisse sur la grille.
		</p>
	{/if}
	{#if byPerson?.length}
		<h3 class="mt-5 mb-2 text-sm font-semibold">Par personne</h3>
		<ul class="flex flex-col gap-2">
			{#each byPerson as row (row.key)}
				<li class="flex items-center gap-2 text-sm">
					<Avatar name={row.label} color={row.color} size={20} />
					<span class="flex-1">{row.label}</span>
					<span class="font-mono text-xs text-ink-2">{formatMinutes(row.minutes)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
