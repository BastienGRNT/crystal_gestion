<script lang="ts">
	import type { TaskCardView } from '$lib/client/views/task-card';
	import FeatureMark from '../../../atoms/FeatureMark.svelte';
	import PickMenu from '../../../molecules/PickMenu.svelte';
	import type { PickOption } from '../../../types';

	interface Props {
		feature: TaskCardView['feature'];
		options: PickOption<string | null>[];
		onpick: (featureId: string | null) => void;
	}

	let { feature, options, onpick }: Props = $props();
</script>

<div class="relative hidden w-[150px] min-w-0 shrink sm:block">
	<PickMenu title="Feature" {options} {onpick}>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Changer de feature"
				class="flex h-7 w-full items-center rounded-md px-2 transition hover:bg-sunken {feature
					? ''
					: 'opacity-0 group-hover:opacity-100'}"
			>
				<FeatureMark
					title={feature?.title ?? 'Sans feature'}
					color={feature?.color ?? 'var(--line-strong)'}
					muted={!feature}
				/>
			</button>
		{/snippet}
	</PickMenu>
</div>
