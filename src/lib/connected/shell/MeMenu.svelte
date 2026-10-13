<script lang="ts">
	import { LogOut, UserRoundCog } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { WORK_STATUS } from '$lib/client/labels';
	import { WORK_STATUSES, type WorkStatus } from '$lib/modules/identity/domain/user';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Popover from '$lib/ui/molecules/Popover.svelte';
	import { presenceFor } from '../team/usePresence.svelte';

	let { projectId }: { projectId: string | null } = $props();
	const { app, actions } = useApp();
	const me = $derived(app.me);
	const presence = $derived(presenceFor(app, me, projectId ?? ''));
	let open = $state(false);
	let anchor = $state<HTMLElement>();
	let note = $state('');

	$effect(() => {
		if (open) note = me.statusNote ?? '';
	});

	function choose(status: WorkStatus) {
		actions.people.setStatus(status, status === me.status ? me.statusNote : null);
		open = false;
	}
</script>

<button
	bind:this={anchor}
	onclick={() => (open = !open)}
	class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-hover"
	aria-label="Mon statut : {presence.status}"
>
	<Avatar
		name={me.name}
		color={me.color}
		size="md"
		dot={WORK_STATUS[me.status].dot}
		ring="ring-sidebar"
	/>
	<span class="min-w-0 flex-1">
		<span class="block truncate text-base font-medium"
			>{firstName(me.name)} <span class="font-normal text-ink-3">(toi)</span></span
		>
		<span class="block truncate text-sm text-ink-3">{presence.status}</span>
	</span>
</button>

<Popover bind:open {anchor} placement="top-start" label="Mon statut" class="w-72">
	<p class="px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
		Ton statut
	</p>
	{#each WORK_STATUSES as status (status)}
		<button
			class={[
				'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-base hover:bg-hover',
				me.status === status && 'font-medium'
			]}
			onclick={() => choose(status)}
		>
			<span class={['size-2.5 rounded-full', WORK_STATUS[status].dot]}></span>
			{WORK_STATUS[status].label}
			{#if me.status === status}<span class="ml-auto text-sm text-ink-3">actuel</span>{/if}
		</button>
	{/each}
	<form
		class="px-1.5 pt-1 pb-1.5"
		onsubmit={(e) => {
			e.preventDefault();
			actions.people.setStatus(me.status, note);
			open = false;
		}}
	>
		<input
			bind:value={note}
			maxlength={80}
			placeholder="Un mot ? (ex. : en réunion jusqu’à 15h)"
			class="h-10 w-full rounded-lg border border-line bg-surface-2 px-3 text-base outline-none focus:border-accent"
		/>
	</form>
	<div class="my-1 h-px bg-line"></div>
	<a
		href="/compte"
		onclick={() => (open = false)}
		class="flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-base hover:bg-hover"
	>
		<UserRoundCog size={17} class="text-ink-3" /> Mon compte
	</a>
	<form method="POST" action="/logout">
		<button
			class="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-base hover:bg-hover"
		>
			<LogOut size={17} class="text-ink-3" /> Se déconnecter
		</button>
	</form>
</Popover>
