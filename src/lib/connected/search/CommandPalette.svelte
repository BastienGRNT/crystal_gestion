<script lang="ts">
	import { CornerDownLeft, Search } from '@lucide/svelte';
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import { rank } from '$lib/client/views/search';
	import Kbd from '$lib/ui/atoms/Kbd.svelte';
	import { paletteItems, type PaletteItem } from './palette-items';

	const context = useApp();
	const { app, overlays } = context;
	let dialog = $state<HTMLDialogElement>();
	let query = $state('');
	let active = $state(0);
	let list = $state<HTMLElement>();

	const project = $derived(app.projects.all.find((p) => p.slug === page.params.slug));
	const items = $derived(overlays.palette ? paletteItems(context, project) : []);
	const results = $derived(
		query.trim()
			? rank(items, query, 6)
			: items.filter((i) => i.group === 'Actions' || i.group === 'Autres projets')
	);

	$effect(() => {
		if (!dialog) return;
		if (overlays.palette && !dialog.open) {
			query = '';
			dialog.showModal();
		}
		if (!overlays.palette && dialog.open) dialog.close();
	});

	$effect(() => {
		void query;
		active = 0;
	});

	$effect(() => {
		list?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
	});

	function run(item: PaletteItem | undefined) {
		if (!item) return;
		overlays.palette = false;
		item.run();
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const step = event.key === 'ArrowDown' ? 1 : -1;
			active = (active + step + results.length) % Math.max(results.length, 1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			run(results[active]);
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={() => (overlays.palette = false)}
	onclick={(e) => e.target === dialog && dialog?.close()}
	aria-label="Chercher"
	class="mx-auto mt-[12vh] max-h-[70dvh] w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-line bg-surface p-0 shadow-pop open:flex open:animate-pop open:flex-col sm:w-[620px]"
>
	<div class="flex items-center gap-3 border-b border-line px-4">
		<Search size={18} class="shrink-0 text-ink-3" aria-hidden="true" />
		<!-- svelte-ignore a11y_autofocus (a dialog focuses its autofocus field when it opens) -->
		<input
			bind:value={query}
			{onkeydown}
			autofocus
			placeholder={project
				? `Chercher dans ${project.name} : tâche, document, accès, canal…`
				: 'Chercher un projet ou une action'}
			aria-label="Chercher"
			class="h-14 min-w-0 flex-1 bg-transparent text-md outline-none"
		/>
		<Kbd keys="Échap" />
	</div>
	<div
		bind:this={list}
		class="scrollbar-thin overflow-y-auto p-2"
		role="listbox"
		aria-label="Résultats"
	>
		{#each results as item, index (item.id)}
			{#if index === 0 || results[index - 1].group !== item.group}
				<p class="px-2.5 pt-2.5 pb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
					{item.group}
				</p>
			{/if}
			<button
				role="option"
				aria-selected={index === active}
				data-index={index}
				onmousemove={() => (active = index)}
				onclick={() => run(item)}
				class={[
					'flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left',
					index === active ? 'bg-active' : ''
				]}
			>
				{#if item.color}
					<span class="mx-[3px] size-3 shrink-0 rounded-[4px]" style:background-color={item.color}
					></span>
				{:else if item.icon}
					<item.icon size={18} class="shrink-0 text-ink-3" aria-hidden="true" />
				{/if}
				<span class="min-w-0 flex-1">
					<span class="block truncate text-base">{item.title}</span>
					{#if item.subtitle}<span class="block truncate text-sm text-ink-3">{item.subtitle}</span
						>{/if}
				</span>
				{#if item.shortcut}<Kbd keys={item.shortcut} />{/if}
				{#if index === active}<CornerDownLeft
						size={15}
						class="shrink-0 text-ink-3"
						aria-hidden="true"
					/>{/if}
			</button>
		{:else}
			<p class="px-3 py-8 text-center text-base text-ink-3">
				Rien trouvé pour « {query} ». Essaie un autre mot.
			</p>
		{/each}
	</div>
</dialog>
