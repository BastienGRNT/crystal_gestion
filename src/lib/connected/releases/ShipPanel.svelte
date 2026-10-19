<script lang="ts">
	import { Copy, ListChecks, Rocket, TriangleAlert, X } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { KINDS } from '$lib/client/labels';
	import { toasts } from '$lib/client/toasts.svelte';
	import {
		clientNoteOf,
		nextVersion,
		shippable,
		toTell
	} from '$lib/modules/roadmap/domain/release';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Task, TaskKind } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();

	const tasks = $derived(app.tasks.all.filter((t) => t.projectId === project.id));
	const ready = $derived(
		tasks.filter(shippable).sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
	);
	const pending = $derived(
		tasks.filter((t) => (t.status === 'review' || t.status === 'doing') && t.kind !== 'action')
	);
	const blocking = $derived(tasks.filter((t) => t.critical && t.status !== 'done'));
	const last = $derived(
		app.releases.all
			.filter((r) => r.projectId === project.id)
			.sort((a, b) => b.shippedAt.localeCompare(a.shippedAt))[0]
	);

	// What is unticked stays for a later version; new work that lands is ticked by default.
	let skipped = $state(new Set<string>());
	const chosen = $derived(ready.filter((t) => !skipped.has(t.id)));
	const moduleOf = (id: string | null) => (id ? (app.components.get(id)?.name ?? null) : null);

	let name = $state('');
	let nameTouched = $state(false);
	let notes = $state('');
	let notesTouched = $state(false);
	const suggested = $derived(
		nextVersion(
			last?.name ?? null,
			chosen.map((t) => t.kind)
		)
	);
	const draftNote = $derived(clientNoteOf(chosen, moduleOf));
	const shownName = $derived(nameTouched ? name : suggested);
	const shownNotes = $derived(notesTouched ? notes : draftNote);
	const tell = $derived(toTell(chosen));
	let shipping = $state(false);
	// Ticked for this release only: the list starts over every time.
	let checked = $state(new Set<number>());
	const unchecked = $derived(project.shipChecklist.length - checked.size);

	function check(i: number) {
		const next = new Set(checked);
		if (next.has(i)) next.delete(i);
		else next.add(i);
		checked = next;
	}

	const setChecklist = (shipChecklist: string[]) => {
		checked = new Set();
		actions.projects.update(project.id, { shipChecklist });
	};

	const GROUPS: TaskKind[] = ['feature', 'bug', 'tech'];

	function toggle(task: Task) {
		const next = new Set(skipped);
		if (next.has(task.id)) next.delete(task.id);
		else next.add(task.id);
		skipped = next;
	}

	async function copyNote() {
		await navigator.clipboard.writeText(shownNotes).catch(() => {});
		toasts.show('Note de version copiée', { tone: 'success', duration: 2000 });
	}

	async function ship() {
		shipping = true;
		const release = await actions.roadmap.ship({
			projectId: project.id,
			name: shownName.trim(),
			taskIds: chosen.map((t) => t.id),
			notes: shownNotes
		});
		shipping = false;
		if (!release) return;
		skipped = new Set();
		checked = new Set();
		name = notes = '';
		nameTouched = notesTouched = false;
	}
</script>

<section
	aria-labelledby="ship-title"
	class="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5"
>
	<div class="flex flex-wrap items-start gap-3">
		<Rocket size={20} class="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
		<div class="min-w-0 flex-1">
			<h2 id="ship-title" class="text-lg font-semibold tracking-tight">Prêt à partir</h2>
			<p class="text-sm text-ink-3">
				Ce qui est terminé et pas encore en prod{last ? ` depuis ${last.name}` : ''}. Décoche ce qui
				attend la prochaine fois.
			</p>
		</div>
	</div>

	{#if !ready.length}
		<p class="text-base text-ink-3">
			Rien de terminé depuis la dernière mise en prod. Les tâches finies du tableau arrivent ici
			toutes seules (sauf les actions, qui ne partent pas en prod).
		</p>
	{:else}
		{#if pending.length || blocking.length}
			<div class="flex flex-col gap-1 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn-text">
				{#if blocking.length}
					<p class="flex items-center gap-1.5 font-semibold">
						<TriangleAlert size={15} />{blocking.length} bug{blocking.length > 1 ? 's' : ''} bloquant{blocking.length >
						1
							? 's'
							: ''} encore ouvert{blocking.length > 1 ? 's' : ''}
					</p>
				{/if}
				{#if pending.length}
					<p>
						Pas encore fini, donc ne part pas :
						{#each pending.slice(0, 6) as t, i (t.id)}{i ? ', ' : ''}<button
								class="font-medium underline-offset-2 hover:underline"
								onclick={() => overlays.openTask(t.id)}
								>#{t.number}{t.status === 'review' ? ' (en relecture)' : ''}</button
							>{/each}{pending.length > 6 ? '…' : ''}
					</p>
				{/if}
			</div>
		{/if}

		<div class="grid gap-4 md:grid-cols-3">
			{#each GROUPS as kind (kind)}
				{@const group = ready.filter((t) => t.kind === kind)}
				{@const meta = KINDS[kind]}
				{#if group.length}
					<div class="flex flex-col gap-1">
						<p class={['flex items-center gap-1.5 text-sm font-semibold', meta.text]}>
							<meta.icon size={15} aria-hidden="true" />{kind === 'bug'
								? 'Corrections'
								: kind === 'feature'
									? 'Nouveautés'
									: 'Technique'}
						</p>
						{#each group as task (task.id)}
							<label
								class="flex min-h-10 items-start gap-2.5 rounded-lg px-1 py-1.5 hover:bg-hover"
							>
								<input
									type="checkbox"
									checked={!skipped.has(task.id)}
									onchange={() => toggle(task)}
									class="mt-1 size-4 shrink-0"
								/>
								<span class="min-w-0 text-base">
									<span class="font-mono text-xs text-ink-3">#{task.number}</span>
									{task.title}
									{#if task.reportedBy}<span class="text-sm text-ink-3">· {task.reportedBy}</span
										>{/if}
								</span>
							</label>
						{/each}
					</div>
				{/if}
			{/each}
		</div>

		<div class="grid gap-4 border-t border-line pt-4 md:grid-cols-[12rem_minmax(0,1fr)]">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-semibold text-ink-2">Nom de la version</span>
				<input
					value={shownName}
					maxlength={40}
					placeholder="v1.0"
					oninput={(e) => ((name = e.currentTarget.value), (nameTouched = true))}
					class="h-11 rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-semibold text-ink-2"
					>Note pour les clients (tu peux la retoucher)</span
				>
				<TextArea
					value={shownNotes}
					rows={3}
					maxHeight={320}
					oninput={(e) => ((notes = e.currentTarget.value), (notesTouched = true))}
				/>
			</label>
		</div>

		<div class="flex flex-col gap-1 border-t border-line pt-4">
			<p class="flex items-center gap-1.5 text-sm font-semibold text-ink-2">
				<ListChecks size={15} aria-hidden="true" />Avant de partir
				<span class="font-normal text-ink-3">· la liste repart à zéro à chaque version</span>
			</p>
			{#each project.shipChecklist as item, i (`${i}-${item}`)}
				<div class="group flex min-h-10 items-center gap-2.5 rounded-lg px-1 hover:bg-hover">
					<label class="flex flex-1 items-center gap-2.5 py-1.5 text-base">
						<input
							type="checkbox"
							checked={checked.has(i)}
							onchange={() => check(i)}
							class="size-4 shrink-0"
						/>
						<span class={checked.has(i) ? 'text-ink-3 line-through' : ''}>{item}</span>
					</label>
					<button
						class="flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-danger-soft hover:text-danger-text"
						aria-label="Retirer « {item} » de la liste"
						onclick={() => setChecklist(project.shipChecklist.filter((_, j) => j !== i))}
						><X size={15} /></button
					>
				</div>
			{/each}
			<InlineAdd
				label="Ajouter un point à vérifier"
				placeholder="Ex. : prévenir le support, puis Entrée"
				onadd={(text) => setChecklist([...project.shipChecklist, text])}
			/>
		</div>

		{#if tell.length}
			<p class="rounded-xl bg-plan-soft px-4 py-3 text-base">
				<span class="font-semibold">À prévenir :</span>
				{tell.join(', ')} <span class="text-ink-2">(ils ont signalé un bug corrigé ici)</span>
			</p>
		{/if}

		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if unchecked > 0}
				<p class="mr-auto text-sm text-warn-text">
					{unchecked} point{unchecked > 1 ? 's' : ''} pas encore coché{unchecked > 1 ? 's' : ''}
				</p>
			{/if}
			<Button icon={Copy} onclick={copyNote} disabled={!shownNotes.trim()}>Copier la note</Button>
			<Button
				variant="primary"
				icon={Rocket}
				loading={shipping}
				disabled={!chosen.length || !shownName.trim()}
				onclick={ship}>C’est en prod ({chosen.length})</Button
			>
		</div>
	{/if}
</section>
