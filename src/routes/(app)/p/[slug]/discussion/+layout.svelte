<script lang="ts">
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import ChannelList from '$lib/connected/chat/ChannelList.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';

	let { children } = $props();
	const { app } = useApp();
	const project = $derived(currentProject(app));
	const inChannel = $derived(!!page.params.channel);
</script>

<svelte:head><title>Discussion · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<div class="flex h-full min-h-0">
		<aside
			class={[
				'w-full shrink-0 scrollbar-thin overflow-y-auto border-r border-line px-3 py-5 lg:block lg:w-72',
				inChannel ? 'hidden' : 'block'
			]}
		>
			<h1 class="px-3 pb-4 text-2xl font-semibold tracking-tight">Discussion</h1>
			<ChannelList {project} />
		</aside>
		<section class={['min-w-0 flex-1', inChannel ? 'flex' : 'hidden lg:flex']}>
			{@render children()}
		</section>
	</div>
{/if}
