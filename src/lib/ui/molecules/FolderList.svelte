<script lang="ts">
	import { Folder, FolderOpen } from '@lucide/svelte';
	import Select from '../atoms/Select.svelte';

	interface FolderItem {
		id: string;
		label: string;
		count: number;
		ref?: string;
	}

	interface Props {
		folders: FolderItem[];
		selected: string;
		onselect: (id: string) => void;
	}

	let { folders, selected, onselect }: Props = $props();
	const options = $derived(folders.map((f) => ({ value: f.id, label: `${f.label} (${f.count})` })));
</script>

<Select
	label="Dossier"
	value={selected}
	{options}
	onchange={onselect}
	class="w-full rounded-md border border-line bg-surface md:hidden"
/>
<nav aria-label="Dossiers" class="hidden flex-col gap-px md:flex">
	{#each folders as folder (folder.id)}
		{@const active = folder.id === selected}
		{@const Icon = active ? FolderOpen : Folder}
		<button
			type="button"
			onclick={() => onselect(folder.id)}
			aria-current={active || undefined}
			class="flex h-8 items-center gap-2 rounded-md px-2 text-left text-sm transition {active
				? 'bg-surface font-medium text-ink shadow-sm ring-1 ring-line'
				: 'text-ink-2 hover:bg-sunken'}"
		>
			<Icon size={14} class="shrink-0 {active ? 'text-accent' : 'text-ink-3'}" />
			<span class="min-w-0 flex-1 truncate">{folder.label}</span>
			<span class="font-mono text-2xs text-ink-3">{folder.count}</span>
		</button>
	{/each}
</nav>
