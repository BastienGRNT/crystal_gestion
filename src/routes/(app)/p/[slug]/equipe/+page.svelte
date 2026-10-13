<script lang="ts">
	import { Archive, ArchiveRestore, Pencil } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import ProjectDialog from '$lib/connected/projects/ProjectDialog.svelte';
	import TeamSettings from '$lib/connected/team/TeamSettings.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import SettingsSection from '$lib/ui/organisms/SettingsSection.svelte';

	const { app, actions } = useApp();
	const project = $derived(currentProject(app));
	let editing = $state(false);
</script>

<svelte:head><title>Équipe · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Équipe et réglages"
		subtitle="Qui fait partie du projet, et comment il s’appelle. Seules les personnes de l’équipe voient le projet."
	/>
	<div class="mx-auto max-w-[1000px] px-4 pb-12 sm:px-8">
		<SettingsSection
			title="L’équipe"
			text="Invite par lien : la personne crée son compte ou se connecte, et arrive ici."
		>
			<TeamSettings {project} />
		</SettingsSection>
		<SettingsSection title="Le projet" text="Nom, description, couleur et date de livraison.">
			<div class="flex flex-wrap items-center gap-4">
				<span class="size-10 rounded-xl" style:background-color={tint(project.color)}></span>
				<div class="min-w-0 flex-1">
					<p class="text-lg font-semibold">{project.name}</p>
					<p class="text-base text-ink-3">{project.description || 'Pas de description'}</p>
				</div>
				<Button icon={Pencil} onclick={() => (editing = true)}>Modifier</Button>
			</div>
		</SettingsSection>
		<SettingsSection
			title="Archiver"
			text="Un projet fini ou en pause sort de ta liste, sans rien perdre."
		>
			{#if project.archivedAt}
				<Button icon={ArchiveRestore} onclick={() => actions.projects.archive(project.id, false)}
					>Ressortir le projet</Button
				>
			{:else}
				<Button icon={Archive} onclick={() => actions.projects.archive(project.id, true)}
					>Archiver le projet</Button
				>
			{/if}
		</SettingsSection>
	</div>
	<ProjectDialog bind:open={editing} {project} />
{/if}
