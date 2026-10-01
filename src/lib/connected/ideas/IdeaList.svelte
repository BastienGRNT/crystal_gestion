<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { newestFirst } from '$lib/client/views/idea-card';
	import type { Idea } from '$lib/modules/ideas/domain/idea';
	import IdeaRow from '$lib/ui/organisms/ideas/IdeaRow.svelte';
	import { ideaHandlers } from './handlers';

	let { ideas }: { ideas: Idea[] } = $props();
	const context = useProject();
	const sources = new ElementSources(context.store);
</script>

{#each newestFirst(ideas) as idea (idea.id)}
	<IdeaRow
		idea={sources.idea(idea)}
		onopen={() => context.peek(idea.ref)}
		handlers={ideaHandlers(context, idea.id)}
	/>
{/each}
