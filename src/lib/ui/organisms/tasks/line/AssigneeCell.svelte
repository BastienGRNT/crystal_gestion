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

<div class="relative w-[60px] shrink-0">
	<PickMenu title="Assigner à" multiple {options} onpick={ontoggle} align="end">
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Assigner"
				class="flex h-7 items-center rounded-md px-1.5 text-ink-3 transition hover:bg-sunken"
			>
				{#if assignees.length}<AvatarStack people={assignees} size={22} />
				{:else}<UserPlus size={15} />{/if}
			</button>
		{/snippet}
	</PickMenu>
</div>
