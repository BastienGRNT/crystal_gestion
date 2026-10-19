<script lang="ts">
	import { Wallet } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { daysSpent } from '$lib/client/views/metrics';
	import type { Project } from '$lib/modules/projects/domain/project';
	import MetricInput from '$lib/ui/molecules/MetricInput.svelte';

	/** `line`: one line for the project home, shown only when a budget is set. */
	let { project, line = false }: { project: Project; line?: boolean } = $props();
	const { app, actions } = useApp();

	const spent = $derived(daysSpent(app.blocks.all, project.id, now.value));
	const ratio = $derived(project.soldDays ? spent / project.soldDays : 0);
	const tone = $derived(ratio >= 1 ? 'bg-danger' : ratio >= 0.8 ? 'bg-warn' : 'bg-accent');
	const days = (n: number) => n.toLocaleString('fr', { maximumFractionDigits: 1 });
</script>

{#if line}
	{#if project.soldDays}
		<a
			href="/p/{project.slug}/indicateurs#budget"
			class="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card hover:border-line-strong"
		>
			<Wallet size={17} class="shrink-0 text-accent-text" aria-hidden="true" />
			<span class="text-base"
				><span class="font-semibold">{days(spent)} j</span>
				<span class="text-ink-2">passés sur {days(project.soldDays)} vendus</span></span
			>
			<span class="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
				<span class={['block h-full rounded-full', tone]} style:width="{Math.min(1, ratio) * 100}%"
				></span>
			</span>
		</a>
	{/if}
{:else}
	<section id="budget" aria-labelledby="budget-title" class="flex scroll-mt-6 flex-col gap-3">
		<div>
			<h2 id="budget-title" class="text-lg font-semibold tracking-tight">Le temps passé</h2>
			<p class="text-sm text-ink-3">
				Compté depuis le planning (le travail posé, une fois passé), en journées de 7 h. Pour un
				projet au forfait, note les jours vendus : l’accueil et le compte rendu diront où vous en
				êtes.
			</p>
		</div>
		<div
			class="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-surface p-4 shadow-card"
		>
			<p class="text-base">
				<span class="text-2xl font-semibold tabular-nums">{days(spent)} j</span>
				<span class="text-ink-2">passés</span>
			</p>
			<label class="flex items-center gap-2 text-sm text-ink-2">
				Jours vendus
				<MetricInput
					label="Jours vendus"
					value={project.soldDays}
					placeholder="Ex. : 10"
					onsave={(soldDays) => actions.projects.update(project.id, { soldDays })}
				/>
			</label>
			{#if project.soldDays}
				<div class="flex min-w-48 flex-1 flex-col gap-1">
					<span class="h-2 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
						<span
							class={['block h-full rounded-full', tone]}
							style:width="{Math.min(1, ratio) * 100}%"
						></span>
					</span>
					<span class={['text-sm', ratio >= 1 ? 'font-semibold text-danger-text' : 'text-ink-3']}
						>{Math.round(ratio * 100)} % du budget{ratio >= 1
							? ' : dépassé, à dire au client ou à absorber'
							: ''}</span
					>
				</div>
			{/if}
		</div>
	</section>
{/if}
