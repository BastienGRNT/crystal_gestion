<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import type { Moscow } from '$lib/modules/features/domain/feature';
	import Avatar from '../../atoms/Avatar.svelte';
	import BugMark from '../../atoms/BugMark.svelte';
	import ProgressBar from '../../atoms/ProgressBar.svelte';
	import PickMenu from '../../molecules/PickMenu.svelte';
	import PriorityMenu from '../../molecules/PriorityMenu.svelte';
	import type { FeatureRowView, PickOption } from '../../types';

	interface Props {
		feature: FeatureRowView;
		owners: PickOption<string>[];
		onpriority: (priority: Moscow) => void;
		onowner: (id: string) => void;
	}

	let { feature, owners, onpriority, onowner }: Props = $props();
	const ratio = $derived(feature.total ? feature.done / feature.total : 0);
</script>

<!-- The link stretches over the row; priority and owner menus sit above it. -->
<div
	class="relative grid min-h-[60px] grid-cols-[44px_minmax(0,1fr)_auto_28px_16px] items-center gap-3 border-b border-line px-3.5 py-2 transition last:border-0 hover:bg-hover md:grid-cols-[44px_minmax(0,1fr)_minmax(110px,200px)_auto_28px_16px]"
>
	<span class="font-mono text-2xs text-ink-3">{feature.ref}</span>
	<a href={feature.href} class="min-w-0 after:absolute after:inset-0 after:content-['']">
		<span class="flex items-center gap-2 font-medium">
			<span class="truncate">{feature.title}</span>
			{#if feature.bugs}<span class="flex items-center gap-0.5 text-xs text-must"
					><BugMark size={13} />{feature.bugs}</span
				>{/if}
		</span>
		{#if feature.description}<span class="block truncate text-xs text-ink-3"
				>{feature.description}</span
			>{/if}
	</a>
	<div class="hidden items-center gap-2.5 md:flex">
		<ProgressBar {ratio} label="Avancement de {feature.title}" />
		<span class="w-[34px] text-xs text-ink-2 tabular-nums">{Math.round(ratio * 100)} %</span>
	</div>
	<div class="relative"><PriorityMenu priority={feature.priority} onchange={onpriority} /></div>
	<div class="relative">
		<PickMenu title="Responsable" options={owners} onpick={onowner} align="end">
			{#snippet trigger(toggle)}
				<button
					type="button"
					onclick={toggle}
					title={feature.owner?.name ?? 'Choisir un responsable'}
					class="flex size-[26px] items-center justify-center rounded-full border border-dashed border-line-strong"
				>
					{#if feature.owner}<Avatar
							name={feature.owner.name}
							color={feature.owner.color}
							size={26}
						/>{/if}
				</button>
			{/snippet}
		</PickMenu>
	</div>
	<ChevronRight size={16} class="text-ink-3" />
</div>
