<script lang="ts">
	import { formatTime } from '$lib/client/format';
	import type { PersonView } from '$lib/client/views/element-view';
	import Avatar from '../../atoms/Avatar.svelte';

	let { author, at }: { author: PersonView | null; at: string } = $props();
</script>

<span class="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-ink-3">
	{#if author}
		<Avatar name={author.name} color={author.color} size={16} />
		<span class="max-sm:hidden">{author.name} ·</span>
	{/if}
	<span class="font-mono text-2xs">{formatTime(at)}</span>
</span>
