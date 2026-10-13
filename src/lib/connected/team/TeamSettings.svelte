<script lang="ts">
	import { LogOut, UserMinus, UserPlus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();
	const members = $derived(
		app.members.all
			.filter((m) => m.projectId === project.id)
			.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
	);
	const meOwner = $derived(members.some((m) => m.userId === app.meId && m.role === 'owner'));

	async function leave() {
		if (await actions.projects.removeMember(project.id, app.meId)) void goto('/projets');
	}
</script>

<ul class="divide-y divide-line">
	{#each members as member (member.id)}
		{@const user = app.users.get(member.userId)}
		{#if user}
			<li class="flex flex-wrap items-center gap-3 py-3.5">
				<Avatar
					name={user.name}
					color={user.color}
					size="lg"
					dot={app.online.includes(user.id) ? 'bg-ok' : null}
				/>
				<div class="min-w-0 flex-1">
					<p class="truncate text-md font-semibold">
						{user.name}{user.id === app.meId ? ' (toi)' : ''}
					</p>
					<p class="truncate text-sm text-ink-3">
						{member.role === 'owner' ? 'Responsable' : 'Membre'} · {user.email} · arrivé·e {relativeTime(
							member.joinedAt,
							now.value
						)}
					</p>
				</div>
				{#if user.id === app.meId}
					<Button size="sm" variant="ghost" icon={LogOut} onclick={leave}>Quitter le projet</Button>
				{:else if meOwner}
					<Button
						size="sm"
						variant="danger"
						icon={UserMinus}
						onclick={() => actions.projects.removeMember(project.id, user.id)}>Retirer</Button
					>
				{/if}
			</li>
		{/if}
	{/each}
</ul>
<Button
	variant="primary"
	icon={UserPlus}
	class="mt-4"
	onclick={() => (overlays.create = { kind: 'invite', projectId: project.id })}
>
	Inviter quelqu’un
</Button>
