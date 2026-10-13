<script lang="ts">
	import { OctagonAlert } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Popover from '$lib/ui/molecules/Popover.svelte';

	let { task, size = 'sm' }: { task: Task; size?: 'sm' | 'md' } = $props();
	const { actions } = useApp();
	let open = $state(false);
	let anchor = $state<HTMLElement>();
	let reason = $state('');

	function toggle(event: MouseEvent) {
		anchor = event.currentTarget as HTMLElement;
		if (task.blockedReason) return actions.tasks.unblock(task.id);
		reason = '';
		open = !open;
	}
</script>

<Button
	{size}
	variant={task.blockedReason ? 'danger' : 'ghost'}
	icon={OctagonAlert}
	onclick={toggle}
	data-no-drag
>
	{task.blockedReason ? 'Débloquer' : 'Bloqué'}
</Button>

<Popover bind:open {anchor} label="Pourquoi c’est bloqué" class="w-80 p-3">
	<form
		class="flex flex-col gap-3"
		onsubmit={(e) => {
			e.preventDefault();
			actions.tasks.block(task.id, reason);
			open = false;
		}}
	>
		<label for="block-{task.id}" class="text-sm font-semibold text-ink-2"
			>Qu’est-ce qui bloque ?</label
		>
		<!-- svelte-ignore a11y_autofocus (opened on purpose by the person) -->
		<input
			id="block-{task.id}"
			bind:value={reason}
			autofocus
			maxlength={200}
			placeholder="En attente du client, d’un accès, d’une décision…"
			class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
		/>
		<Button type="submit" variant="primary">Marquer comme bloqué</Button>
	</form>
</Popover>
