<script lang="ts">
	import {
		CalendarDays,
		FolderOpen,
		House,
		KeyRound,
		MessagesSquare,
		Search,
		Settings2,
		SquareKanban,
		Target,
		UserPlus
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { activeProjects, channelsOf, projectCounts, unreadIn } from '$lib/client/views/workspace';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Kbd from '$lib/ui/atoms/Kbd.svelte';
	import NavItem from '$lib/ui/molecules/NavItem.svelte';
	import { currentProject } from '../projects/current.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import MeMenu from './MeMenu.svelte';
	import ProjectSwitcher from './ProjectSwitcher.svelte';
	import TeamMember from './TeamMember.svelte';

	let { onnavigate }: { onnavigate?: () => void } = $props();
	const { app, overlays } = useApp();

	const project = $derived(currentProject(app));
	const path = $derived(page.url.pathname);
	const base = $derived(project ? `/p/${project.slug}` : '');
	const counts = $derived(project ? projectCounts(app.tasks.all, project.id) : null);
	const unread = $derived(
		project ? unreadIn(channelsOf(app.channels.all, project.id), app.channelStates.all) : null
	);
	const others = $derived(
		project ? teamOrder(app, project.id).filter((u) => u.id !== app.meId) : []
	);
	const projects = $derived(activeProjects(app.projects.all));
	const at = (suffix: string) => (suffix ? path.startsWith(base + suffix) : path === base);
</script>

<div class="flex h-full scrollbar-thin flex-col gap-4 overflow-y-auto px-3 pt-3 pb-3">
	<ProjectSwitcher {project} />

	<button
		onclick={() => (overlays.palette = true)}
		class="flex h-10 items-center gap-2.5 rounded-xl px-3 text-base text-ink-3 transition-colors hover:bg-hover hover:text-ink-2"
	>
		<Search size={17} aria-hidden="true" />
		<span class="flex-1 text-left">Chercher</span>
		<Kbd keys="⌘K" />
	</button>

	{#if project && counts && unread}
		<nav aria-label="Le projet" class="flex flex-col gap-0.5">
			<NavItem href={base} label="Accueil" icon={House} active={at('')} onclick={onnavigate} />
			<NavItem
				href="{base}/tableau"
				label="Tableau"
				icon={SquareKanban}
				active={at('/tableau')}
				badge={counts.review}
				onclick={onnavigate}
			/>
			<NavItem
				href="{base}/priorites"
				label="Priorités"
				icon={Target}
				active={at('/priorites')}
				badge={counts.inbox}
				onclick={onnavigate}
			/>
			<NavItem
				href="{base}/discussion"
				label="Discussion"
				icon={MessagesSquare}
				active={at('/discussion')}
				badge={unread.mentions || unread.unread}
				badgeTone={unread.mentions ? 'strong' : 'soft'}
				onclick={onnavigate}
			/>
			<NavItem
				href="{base}/planning"
				label="Planning"
				icon={CalendarDays}
				active={at('/planning')}
				onclick={onnavigate}
			/>
			<NavItem
				href="{base}/documents"
				label="Documents"
				icon={FolderOpen}
				active={at('/documents')}
				onclick={onnavigate}
			/>
			<NavItem
				href="{base}/acces"
				label="Accès"
				icon={KeyRound}
				active={at('/acces')}
				onclick={onnavigate}
			/>
		</nav>

		<section aria-labelledby="team-title" class="mt-auto flex flex-col gap-0.5">
			<div class="flex items-center justify-between pr-0.5 pl-2.5">
				<h2 id="team-title" class="text-xs font-semibold tracking-wide text-ink-3 uppercase">
					Équipe du projet
				</h2>
				<div class="flex">
					<IconButton
						icon={UserPlus}
						label="Inviter quelqu’un"
						size="sm"
						onclick={() => (overlays.create = { kind: 'invite', projectId: project.id })}
					/>
					<a
						href="{base}/equipe"
						onclick={onnavigate}
						class="flex size-8 items-center justify-center rounded-xl text-ink-3 hover:bg-hover hover:text-ink"
						aria-label="Équipe et réglages du projet"
						title="Équipe et réglages du projet"
					>
						<Settings2 size={16} />
					</a>
				</div>
			</div>
			{#each others as user (user.id)}
				<TeamMember {user} projectId={project.id} />
			{:else}
				<button
					onclick={() => (overlays.create = { kind: 'invite', projectId: project.id })}
					class="mx-0.5 rounded-xl border border-dashed border-line-strong px-3 py-3 text-left text-sm text-ink-2 hover:border-ink-4"
				>
					Tu es seul·e ici. <span class="font-semibold text-accent-text"
						>Invite la personne avec qui tu bosses</span
					> pour voir qui fait quoi.
				</button>
			{/each}
			<div class="my-1 h-px bg-line"></div>
			<MeMenu projectId={project.id} />
		</section>
	{:else}
		<nav aria-label="Projets" class="flex flex-col gap-0.5">
			{#each projects as p (p.id)}
				<NavItem href="/p/{p.slug}" label={p.name} onclick={onnavigate}>
					{#snippet leading()}<span
							class="size-3.5 rounded-[4px]"
							style:background-color={tint(p.color)}
						></span>{/snippet}
				</NavItem>
			{/each}
		</nav>
		<div class="mt-auto"><MeMenu projectId={null} /></div>
	{/if}
</div>
