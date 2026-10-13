<script lang="ts">
	import { Hash, Plus } from '@lucide/svelte';
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import { channelName, channelsOf } from '$lib/client/views/workspace';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';

	let { project }: { project: Project } = $props();
	const { app, overlays } = useApp();
	const channels = $derived(channelsOf(app.channels.all, project.id));
	const activeId = $derived(page.params.channel);
</script>

<nav aria-label="Canaux" class="flex flex-col gap-0.5">
	{#each channels as channel (channel.id)}
		{@const state = app.channelStates.get(channel.id)}
		{@const active = activeId === channel.id}
		<a
			href="/p/{project.slug}/discussion/{channel.id}"
			aria-current={active ? 'page' : undefined}
			class={[
				'flex h-11 items-center gap-2.5 rounded-xl px-3 text-base transition-colors',
				active
					? 'bg-surface font-semibold text-ink shadow-card'
					: 'text-ink-2 hover:bg-hover hover:text-ink',
				!active && state?.unread && 'font-semibold text-ink'
			]}
		>
			<Hash size={17} class="shrink-0 text-ink-3" aria-hidden="true" />
			<span class="min-w-0 flex-1 truncate">{channelName(channel)}</span>
			{#if !active && state?.mentions}
				<span
					class="min-w-6 rounded-full bg-accent px-1.5 text-center text-xs leading-5 font-semibold text-accent-ink"
					>@{state.mentions}</span
				>
			{:else if !active && state?.unread}
				<span
					class="min-w-6 rounded-full bg-sunken px-1.5 text-center text-xs leading-5 font-semibold text-ink-2"
					>{state.unread}</span
				>
			{/if}
		</a>
	{/each}
	<Button
		variant="ghost"
		icon={Plus}
		class="mt-2 justify-start"
		onclick={() => (overlays.create = { kind: 'channel', projectId: project.id })}
	>
		Nouveau canal
	</Button>
	<p class="px-3 pt-1 text-sm text-ink-3">
		Un canal par sujet : mise en prod, design, client… Les commentaires d’une tâche restent sur sa
		fiche.
	</p>
</nav>
