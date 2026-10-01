<script lang="ts">
	import type { TaskCardView } from '$lib/client/views/task-card';
	import Dot from '../../../atoms/Dot.svelte';
	import PickMenu from '../../../molecules/PickMenu.svelte';
	import { PRIORITY_COLORS } from '../../../tones';
	import type { PickOption } from '../../../types';

	interface Props {
		feature: TaskCardView['feature'];
		options: PickOption<string | null>[];
		onpick: (featureId: string | null) => void;
		width?: string;
	}

	let { feature, options, onpick, width = 'w-[150px]' }: Props = $props();
</script>

<div class="relative hidden min-w-0 shrink {width} sm:block">
	<PickMenu title="Feature" {options} {onpick}>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Changer de feature"
				class="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-xs transition hover:bg-sunken {feature
					? 'text-ink-2'
					: 'text-ink-3'}"
			>
				<Dot color={feature ? PRIORITY_COLORS[feature.priority] : 'var(--line-strong)'} />
				<span class="truncate">{feature?.title ?? 'Sans feature'}</span>
			</button>
		{/snippet}
	</PickMenu>
</div>
