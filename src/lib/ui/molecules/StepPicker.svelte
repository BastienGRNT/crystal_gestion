<script lang="ts">
	import { ChevronDown, Compass } from '@lucide/svelte';
	import type { StepOption } from '../types';
	import Menu from './Menu.svelte';

	interface Props {
		steps: StepOption[];
		value: string | null;
		onchange: (value: string | null) => void;
		label?: string;
	}

	let { steps, value, onchange, label = 'Étape' }: Props = $props();
	const selected = $derived(steps.find((s) => s.id === value));
</script>

<Menu
	{label}
	placement="bottom-start"
	items={[
		...steps.map((step) => ({
			label: step.current ? `${step.title} (en cours)` : step.title,
			run: () => onchange(step.id)
		})),
		'separator',
		{ label: 'Sans étape', run: () => onchange(null) }
	]}
>
	{#snippet trigger({ props })}
		<button
			type="button"
			{...props}
			class="inline-flex h-10 max-w-full items-center gap-2 rounded-xl border border-line bg-surface px-3 text-base shadow-card hover:border-line-strong"
		>
			<Compass size={16} class="shrink-0 text-ink-3" aria-hidden="true" />
			<span class={['truncate', !selected && 'text-ink-3']}>{selected?.title ?? 'Sans étape'}</span>
			<ChevronDown size={15} class="shrink-0 text-ink-3" aria-hidden="true" />
		</button>
	{/snippet}
</Menu>
