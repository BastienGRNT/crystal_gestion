<script lang="ts">
	import { Copy, Link2, UserPlus } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import Button from '../../atoms/Button.svelte';
	import type { Person } from '../../types';

	interface Props {
		link: string | null;
		candidates: Person[];
		oninvite: () => void;
		oncopy: () => void;
		onadd: (id: string) => void;
	}

	let { link, candidates, oninvite, oncopy, onadd }: Props = $props();
</script>

<div class="mt-4 flex flex-col gap-3">
	{#if link}
		<div
			class="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent-soft/60 p-2 pl-3"
		>
			<Link2 size={14} class="shrink-0 text-accent" />
			<code class="min-w-0 flex-1 truncate font-mono text-xs">{link}</code>
			<Button size="sm" variant="primary" onclick={oncopy}><Copy size={13} /> Copier</Button>
		</div>
		<p class="text-xs text-ink-3">Lien à usage unique, valable 7 jours.</p>
	{:else}
		<Button onclick={oninvite}><UserPlus size={14} /> Créer un lien d’invitation</Button>
	{/if}
	{#each candidates as person (person.id)}
		<button
			onclick={() => onadd(person.id)}
			class="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-ink-2 hover:bg-sunken"
		>
			<Avatar name={person.name} color={person.color} size={20} /> Ajouter {person.name}
		</button>
	{/each}
</div>
