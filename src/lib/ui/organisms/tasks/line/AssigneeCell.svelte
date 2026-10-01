<script lang="ts">
	import { UserPlus } from '@lucide/svelte';
	import AvatarStack from '../../../molecules/AvatarStack.svelte';
	import PickMenu from '../../../molecules/PickMenu.svelte';
	import type { Person, PickOption } from '../../../types';

	interface Props {
		assignees: Person[];
		options: PickOption<string>[];
		ontoggle: (id: string) => void;
	}

	let { assignees, options, ontoggle }: Props = $props();
</script>

<div class="relative flex w-14 shrink-0 justify-end">
	<PickMenu title="Assigner à" multiple {options} onpick={ontoggle} align="end">
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Assigner"
				class="flex h-7 items-center rounded-md px-1.5 text-ink-3 transition hover:bg-sunken"
			>
				{#if assignees.length}<AvatarStack people={assignees} size={20} />
				{:else}<UserPlus size={14} class="opacity-0 group-hover:opacity-100" />{/if}
			</button>
		{/snippet}
	</PickMenu>
</div>
