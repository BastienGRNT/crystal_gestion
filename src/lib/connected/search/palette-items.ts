import {
	CalendarDays,
	Compass,
	Gavel,
	FileText,
	FolderOpen,
	FolderPlus,
	Hash,
	House,
	KeyRound,
	Lightbulb,
	MessageSquarePlus,
	SquareCheck,
	SquareKanban,
	SquarePlus,
	SunMoon,
	Target,
	UserPlus,
	UserRoundCog
} from '@lucide/svelte';
import { goto } from '$app/navigation';
import type { AppContext } from '$lib/client/context';
import { STATUS_LABEL, tint } from '$lib/client/labels';
import { applyTheme } from '$lib/client/theme';
import { activeProjects, channelName, channelsOf } from '$lib/client/views/workspace';
import { formatSize } from '$lib/modules/files/domain/file';
import type { Project } from '$lib/modules/projects/domain/project';
import { hostOf } from '$lib/modules/vault/domain/entry';
import type { Icon } from '$lib/ui/types';

export interface PaletteItem {
	id: string;
	group: string;
	title: string;
	subtitle?: string;
	keywords: string;
	icon?: Icon;
	color?: string;
	shortcut?: string;
	run: () => void;
}

const action = (
	id: string,
	title: string,
	icon: Icon,
	run: () => void,
	shortcut?: string
): PaletteItem => ({
	id,
	group: 'Actions',
	title,
	keywords: title,
	icon,
	run,
	shortcut
});

/** What the open project holds: its pages, tasks, files, accesses and channels. */
function projectItems({ app, overlays }: AppContext, project: Project): PaletteItem[] {
	const base = `/p/${project.slug}`;
	const page = (id: string, title: string, icon: Icon, href: string) =>
		action(id, title, icon, () => goto(href));
	return [
		action(
			'new-task',
			'Nouvelle tâche',
			SquarePlus,
			() => overlays.newTask({ projectId: project.id }),
			'N'
		),
		action(
			'new-idea',
			'Noter une idée',
			Lightbulb,
			() => overlays.newTask({ projectId: project.id, status: 'idea' }),
			'I'
		),
		action(
			'new-channel',
			'Nouveau canal de discussion',
			MessageSquarePlus,
			() => (overlays.create = { kind: 'channel', projectId: project.id })
		),
		action(
			'invite',
			'Inviter quelqu’un dans le projet',
			UserPlus,
			() => (overlays.create = { kind: 'invite', projectId: project.id })
		),
		action('new-decision', 'Noter une décision', Gavel, () =>
			overlays.decide({ projectId: project.id, text: '' })
		),
		page('go-home', 'Accueil du projet', House, base),
		page('go-roadmap', 'Feuille de route', Compass, `${base}/feuille-de-route`),
		page('go-board', 'Tableau', SquareKanban, `${base}/tableau`),
		page('go-matrix', 'Priorités', Target, `${base}/priorites`),
		page('go-planning', 'Planning', CalendarDays, `${base}/planning`),
		page('go-files', 'Documents', FolderOpen, `${base}/documents`),
		page('go-vault', 'Accès', KeyRound, `${base}/acces`),
		...app.tasks.all
			.filter((t) => t.projectId === project.id)
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
			.map((t) => ({
				id: `task-${t.id}`,
				group: 'Tâches',
				title: t.title,
				subtitle: `${STATUS_LABEL[t.status]}${t.number ? ` · #${t.number}` : ''}`,
				keywords: `${t.title} #${t.number} ${t.notes.slice(0, 300)}`,
				icon: t.status === 'idea' ? Lightbulb : SquareCheck,
				run: () => overlays.openTask(t.id)
			})),
		...app.milestones.all
			.filter((m) => m.projectId === project.id)
			.map((m) => ({
				id: `step-${m.id}`,
				group: 'Étapes',
				title: m.title,
				subtitle: m.closedAt ? 'Close' : m.doneWhen || undefined,
				keywords: `${m.title} ${m.doneWhen}`,
				icon: Compass,
				run: () => goto(`${base}/feuille-de-route#etape-${m.id}`)
			})),
		...app.decisions.all
			.filter((d) => d.projectId === project.id)
			.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
			.map((d) => ({
				id: `decision-${d.id}`,
				group: 'Décisions',
				title: d.text,
				subtitle: d.why || undefined,
				keywords: `${d.text} ${d.why}`,
				icon: Gavel,
				run: () => goto(`${base}/feuille-de-route#decision-${d.id}`)
			})),
		...app.files.all
			.filter((f) => f.projectId === project.id)
			.map((f) => ({
				id: `file-${f.id}`,
				group: 'Documents',
				title: f.name,
				subtitle: formatSize(f.size),
				keywords: f.name,
				icon: FileText,
				run: () => (overlays.previewFileId = f.id)
			})),
		...app.vault.all
			.filter((e) => e.projectId === project.id)
			.map((e) => ({
				id: `vault-${e.id}`,
				group: 'Accès',
				title: e.name,
				subtitle: [hostOf(e.url), e.username].filter(Boolean).join(' · '),
				keywords: `${e.name} ${e.url ?? ''} ${e.username ?? ''}`,
				icon: KeyRound,
				run: () => goto(`${base}/acces`)
			})),
		...channelsOf(app.channels.all, project.id).map((c) => ({
			id: `channel-${c.id}`,
			group: 'Discussion',
			title: `#${channelName(c)}`,
			keywords: `discussion canal ${channelName(c)}`,
			icon: Hash,
			run: () => goto(`${base}/discussion/${c.id}`)
		}))
	];
}

/** Everything Cmd+K can find or do, built from the live state. */
export function paletteItems(context: AppContext, project: Project | undefined): PaletteItem[] {
	const { app, overlays } = context;
	const dark = document.documentElement.dataset.theme === 'dark';
	return [
		...(project ? projectItems(context, project) : []),
		action(
			'new-project',
			'Nouveau projet',
			FolderPlus,
			() => (overlays.create = { kind: 'project' })
		),
		action('account', 'Mon compte', UserRoundCog, () => goto('/compte')),
		action('theme', dark ? 'Passer en thème clair' : 'Passer en thème sombre', SunMoon, () =>
			applyTheme(dark ? 'light' : 'dark')
		),
		...activeProjects(app.projects.all)
			.filter((p) => p.id !== project?.id)
			.map((p) => ({
				id: `project-${p.id}`,
				group: 'Autres projets',
				title: p.name,
				subtitle: p.description || undefined,
				keywords: `${p.name} ${p.description}`,
				color: tint(p.color),
				run: () => goto(`/p/${p.slug}`)
			}))
	];
}
