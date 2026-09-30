<script lang="ts">
	import { Check, CornerDownRight } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import RichText from '../../molecules/RichText.svelte';
	import type { QuestionView, RefView } from '../../types';

	interface Props {
		items: QuestionView[];
		resolve: (ref: string) => RefView | undefined;
		onresolve: (id: string) => void;
	}

	let { items, resolve, onresolve }: Props = $props();
</script>

<ul class="flex flex-col gap-2">
	{#each items as item (item.id)}
		<li class="animate-rise rounded-lg border border-line bg-surface p-3">
			<p class="flex items-center gap-2 text-xs text-ink-3">
				<Avatar name={item.author.name} color={item.author.color} size={18} />
				<span class="font-medium text-ink-2">{item.author.name}</span> · {item.when}
			</p>
			<RichText text={item.excerpt} {resolve} class="mt-1.5 text-base leading-snug" />
			<div class="mt-2.5 flex gap-1.5">
				<a
					href={item.href}
					class="inline-flex h-7 items-center gap-1.5 rounded-md bg-accent-soft px-2.5 text-sm font-medium text-accent hover:brightness-105"
					><CornerDownRight size={13} /> Répondre</a
				>
				<button
					onclick={() => onresolve(item.id)}
					class="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm text-ink-3 hover:bg-sunken hover:text-ink"
					><Check size={13} /> Traité</button
				>
			</div>
		</li>
	{/each}
</ul>
