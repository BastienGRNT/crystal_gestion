<script lang="ts">
	import { useApp } from '$lib/client/context';
	import type { CreateRequest } from '$lib/client/overlays.svelte';
	import ChannelDialog from '../chat/ChannelDialog.svelte';
	import FilePreview from '../files/FilePreview.svelte';
	import ProjectDialog from '../projects/ProjectDialog.svelte';
	import DecisionDialog from '../roadmap/DecisionDialog.svelte';
	import CommandPalette from '../search/CommandPalette.svelte';
	import CreateTaskDialog from '../tasks/CreateTaskDialog.svelte';
	import TaskDrawer from '../tasks/TaskDrawer.svelte';
	import InviteDialog from '../team/InviteDialog.svelte';
	import VaultDialog from '../vault/VaultDialog.svelte';

	const { overlays } = useApp();

	/** Two-way binding of a dialog to "is this kind of creation open?". */
	const opened = (kind: CreateRequest['kind']) => ({
		get: () => overlays.create?.kind === kind,
		set: (open: boolean) => {
			if (!open && overlays.create?.kind === kind) overlays.create = null;
		}
	});
	const task = opened('task');
	const project = opened('project');
	const channel = opened('channel');
	const invite = opened('invite');
	const vault = opened('vault');
	const decision = opened('decision');
	const request = $derived(overlays.create);
</script>

<TaskDrawer />
<CreateTaskDialog
	bind:open={task.get, task.set}
	seed={request?.kind === 'task' ? request.seed : {}}
/>
<ProjectDialog bind:open={project.get, project.set} />
{#if request?.kind === 'channel'}<ChannelDialog
		bind:open={channel.get, channel.set}
		projectId={request.projectId}
	/>{/if}
{#if request?.kind === 'invite'}<InviteDialog
		bind:open={invite.get, invite.set}
		projectId={request.projectId}
	/>{/if}
{#if request?.kind === 'vault'}
	<VaultDialog
		bind:open={vault.get, vault.set}
		projectId={request.projectId}
		entryId={request.entryId}
	/>
{/if}
{#if request?.kind === 'decision'}
	<DecisionDialog bind:open={decision.get, decision.set} seed={request.seed} />
{/if}
<FilePreview />
<CommandPalette />
