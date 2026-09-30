<script lang="ts">
	import Avatar from '$lib/ui/atoms/Avatar.svelte';

	type Person = { id: string; name: string; color: string; online: boolean };
	let { people, team }: { people: Person[]; team: boolean } = $props();
	const swatch = 'inline-block h-3 w-4 rounded-[3px]';
</script>

<div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2">
	<span class="flex items-center gap-1.5"
		><span class="{swatch} border-l-2 border-accent bg-accent-soft"></span>Dispo</span
	>
	<span class="flex items-center gap-1.5"
		><span
			class="{swatch} border border-dashed border-accent/60 bg-[repeating-linear-gradient(135deg,var(--accent-soft)_0_2px,transparent_2px_5px)]"
		></span>Peut-être</span
	>
	<span class="flex items-center gap-1.5"
		><span class="{swatch} border-l-[3px] border-feature-0 bg-feature-0/20"></span>Temps passé
		(couleur de la feature, voir le récap)</span
	>
	{#if team}
		<span class="flex items-center gap-1.5"
			><span class="{swatch} border-l-2 border-accent bg-accent/10"></span>On peut bosser ensemble</span
		>
		<span class="ml-auto flex flex-wrap items-center gap-3">
			{#each people as person (person.id)}
				<span class="flex items-center gap-1.5 text-ink-2"
					><Avatar
						name={person.name}
						color={person.color}
						size={18}
						online={person.online}
					/>{person.name}</span
				>
			{/each}
		</span>
	{/if}
</div>
