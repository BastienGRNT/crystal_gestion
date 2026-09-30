<script lang="ts">
	import { timeAgo } from '$lib/client/format';
	import type { IdeaView } from '$lib/client/views/idea-card';
	import Avatar from '../../atoms/Avatar.svelte';
	import FeatureTag from '../../molecules/FeatureTag.svelte';

	let { idea }: { idea: IdeaView } = $props();
</script>

<div class="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-3">
	{#if idea.feature}<FeatureTag feature={idea.feature} />{/if}
	{#if idea.author}
		<span class="flex items-center gap-1.5">
			<Avatar name={idea.author.name} color={idea.author.color} size={16} />{idea.author.name}
		</span>
	{/if}
	<span>{timeAgo(idea.createdAt)}</span>
	<span class="font-mono text-2xs">{idea.ref}</span>
</div>
