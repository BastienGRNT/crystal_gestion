<script lang="ts">
	import type { ActivityView } from '$lib/client/views/activity';
	import Avatar from '../atoms/Avatar.svelte';
	import RefChip from '../molecules/RefChip.svelte';

	let { items }: { items: ActivityView[] } = $props();
</script>

<ol class="relative flex flex-col">
	<span class="absolute top-3 bottom-3 left-[11px] w-px bg-line" aria-hidden="true"></span>
	{#each items as item (item.id)}
		<li class="relative flex animate-rise gap-3 py-2">
			<Avatar name={item.actor.name} color={item.actor.color} size={23} />
			<p class="min-w-0 flex-1 pt-0.5 text-[13.5px] leading-relaxed">
				<span class="font-medium">{item.actor.name}</span>
				<span class="text-ink-2">{item.verb}</span>
				{#if item.deleted}
					<span class="text-ink-3 line-through">{item.element.title}</span>
				{:else}
					<RefChip view={item.element} fallback={item.element.ref} />
				{/if}
				{#if item.detail}<span class="text-[12.5px] text-ink-3">· {item.detail}</span>{/if}
				<span class="block text-[11.5px] text-ink-3">{item.when}</span>
			</p>
		</li>
	{/each}
</ol>
