<script lang="ts">
	import type { ActivityView } from '$lib/client/views/activity';
	import Avatar from '../atoms/Avatar.svelte';
	import RefChip from '../molecules/RefChip.svelte';

	let { items }: { items: ActivityView[] } = $props();
</script>

<ol class="flex flex-col">
	{#each items as item (item.id)}
		<li class="flex min-h-[38px] animate-rise items-center gap-2.5 rounded-lg px-2 hover:bg-hover">
			<Avatar name={item.actor.name} color={item.actor.color} size={22} />
			<p class="min-w-0 flex-1 truncate text-sm">
				<span class="font-medium">{item.actor.name}</span>
				<span class="text-ink-2">{item.verb}</span>
				{#if item.deleted}
					<span class="text-ink-3 line-through">{item.element.title}</span>
				{:else}
					<RefChip view={item.element} fallback={item.element.ref} />
				{/if}
				{#if item.detail}<span class="text-ink-3">· {item.detail}</span>{/if}
			</p>
			<span class="shrink-0 text-xs text-ink-3">{item.when}</span>
		</li>
	{/each}
</ol>
