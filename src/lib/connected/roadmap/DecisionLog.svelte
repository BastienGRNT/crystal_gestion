<script lang="ts">
	import { Gavel, Search } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, shortDay } from '$lib/client/format';
	import { score } from '$lib/client/views/search';
	import { canWithdraw, supersededIds, type Decision } from '$lib/modules/roadmap/domain/decision';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import RichText from '$lib/ui/organisms/RichText.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();
	let query = $state('');
	// The composer, right above the log: what was decided, then why.
	let text = $state('');
	let why = $state('');
	let replacing = $state<Decision | null>(null);
	let input = $state<HTMLInputElement>();

	function note(event: SubmitEvent) {
		event.preventDefault();
		const seed = { projectId: project.id, text, why, supersedes: replacing?.id ?? null };
		if (!actions.roadmap.decide(seed)) return;
		text = '';
		why = '';
		replacing = null;
	}

	function replace(d: Decision) {
		replacing = d;
		text = d.text;
		why = '';
		input?.focus();
		input?.select();
	}

	const all = $derived(
		app.decisions.all
			.filter((d) => d.projectId === project.id)
			.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
	);
	const replaced = $derived(supersededIds(all));
	const shown = $derived(
		query ? all.filter((d) => score(`${d.text} ${d.why}`, query) !== null) : all
	);

	/** Where it came from, so the context is one click away. */
	function origin(d: Decision): { label: string; open: () => void } | null {
		const task = app.tasks.get(d.taskId);
		if (task) return { label: `#${task.number}`, open: () => overlays.openTask(task.id) };
		const step = app.milestones.get(d.milestoneId);
		if (step)
			return {
				label: `étape « ${step.title} »`,
				open: () => document.getElementById(`etape-${step.id}`)?.scrollIntoView()
			};
		return null;
	}

	const newer = (id: string) => all.find((d) => d.supersedes === id);
	/** The message it came from, when this screen knows where it lives. */
	function messageHref(d: Decision) {
		if (!d.messageId) return null;
		const message = app.messages.find(d.messageId) ?? app.questions.get(d.messageId);
		const channel = app.channels.get(message?.channelId);
		if (!channel) return `/p/${project.slug}/discussion`;
		return channel.taskId
			? `?tache=${channel.taskId}`
			: `/p/${project.slug}/discussion/${channel.id}?message=${d.messageId}`;
	}
</script>

<section aria-labelledby="decisions" class="flex flex-col gap-3">
	<header class="flex items-start gap-3">
		<div class="min-w-0 flex-1">
			<h2 id="decisions" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
				<Gavel size={18} class="text-ok-text" aria-hidden="true" />Décisions
			</h2>
			<p class="text-sm text-ink-3">
				Ce qu’on a tranché et pourquoi. Écris-le ici, ou « C’est décidé » sur un message ; c’est
				noté tout seul quand une date bouge.
			</p>
		</div>
	</header>

	<form class="flex flex-col gap-2" onsubmit={note}>
		{#if replacing}
			<p class="text-sm text-ink-2">
				Remplace « {replacing.text} » (elle restera visible, barrée) ·
				<button
					type="button"
					class="font-medium text-accent-text hover:underline"
					onclick={() => ((replacing = null), (text = ''))}>annuler</button
				>
			</p>
		{/if}
		<input
			bind:this={input}
			bind:value={text}
			maxlength={280}
			aria-label="Ce qu’on a décidé"
			placeholder="Ce qu’on a décidé, puis Entrée"
			class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none placeholder:text-ink-3 focus:border-accent focus:ring-4 focus:ring-accent-soft"
		/>
		{#if text.trim()}
			<TextArea
				bind:value={why}
				maxlength={500}
				rows={2}
				aria-label="Pourquoi (facultatif)"
				placeholder="Pourquoi (facultatif) : ce qui a fait pencher la balance"
				onkeydown={(e) => {
					if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
				}}
			/>
			<div class="flex items-center gap-2">
				<p class="flex-1 text-xs text-ink-3">Entrée dans le premier champ, ou Ctrl+Entrée ici.</p>
				<Button type="submit" size="sm" variant="primary" icon={Gavel}>Noter la décision</Button>
			</div>
		{/if}
	</form>

	{#if all.length > 5}
		<label class="relative">
			<Search
				size={16}
				class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
				aria-hidden="true"
			/>
			<input
				bind:value={query}
				type="search"
				placeholder="Chercher une décision"
				class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-3 pl-9 text-base outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
			/>
		</label>
	{/if}

	{#if shown.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface shadow-card"
		>
			{#each shown as d (d.id)}
				{@const from = origin(d)}
				{@const old = replaced.has(d.id)}
				<li
					id="decision-{d.id}"
					class="flex scroll-mt-6 items-start gap-2 px-3.5 py-3 target:bg-accent-soft"
				>
					<div class="min-w-0 flex-1">
						<p class={['text-base', old && 'text-ink-3 line-through decoration-ink-4']}>{d.text}</p>
						{#if d.why}<div class="text-ink-2"><RichText body={d.why} size="base" /></div>{/if}
						<p class="mt-0.5 text-xs text-ink-3">
							{firstName(app.users.get(d.decidedBy)?.name ?? 'Quelqu’un')} · {shortDay(
								d.decidedAt.slice(0, 10)
							)}{#if d.messageId}
								·
								<a href={messageHref(d)} class="font-medium hover:text-accent-text hover:underline"
									>depuis la discussion</a
								>{/if}{#if from}
								·
								<button
									class="font-medium hover:text-accent-text hover:underline"
									onclick={from.open}>{from.label}</button
								>{/if}{#if old && newer(d.id)}
								·
								<a
									href="#decision-{newer(d.id)!.id}"
									class="font-medium hover:text-accent-text hover:underline">remplacée</a
								>{/if}{#if !old}
								·
								<button
									class="py-2 font-medium hover:text-accent-text hover:underline"
									onclick={() => replace(d)}>Remplacer</button
								>{#if canWithdraw(d, app.meId)}
									·
									<button
										class="py-2 font-medium hover:text-danger-text hover:underline"
										onclick={() => actions.roadmap.removeDecision(d)}>Retirer</button
									>{/if}{/if}
						</p>
					</div>
				</li>
			{/each}
		</ul>
	{:else if query}
		<p class="text-base text-ink-3">Aucune décision ne correspond.</p>
	{:else}
		<p class="rounded-xl border border-dashed border-line-strong px-4 py-4 text-base text-ink-3">
			Rien de tranché pour l’instant. Écris-le au-dessus, ou, dans la discussion, survole le message
			et clique sur le marteau.
		</p>
	{/if}
</section>
