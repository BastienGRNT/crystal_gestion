<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { toasts } from '$lib/client/toasts.svelte';
	import InvitePanel from '$lib/ui/organisms/project/InvitePanel.svelte';
	import TeamList from '$lib/ui/organisms/project/TeamList.svelte';
	import type { Person } from '$lib/ui/types';

	let { users }: { users: Person[] } = $props();
	const { store, actions } = useProject();
	let link = $state<string | null>(null);
	const candidates = $derived(users.filter((user) => !store.members.get(user.id)));

	async function invite() {
		const invitation = await actions.project.createInvitation();
		if (invitation) link = `${location.origin}/invite/${invitation.token}`;
	}

	async function copy() {
		if (!link) return;
		await navigator.clipboard.writeText(link).catch(() => null);
		toasts.success('Lien copié');
	}
</script>

<TeamList members={store.members.items} online={store.online} />
<InvitePanel {link} {candidates} oninvite={invite} oncopy={copy} onadd={(id) => actions.project.addMember(id)} />
