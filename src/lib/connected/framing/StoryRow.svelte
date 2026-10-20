<script lang="ts">
	import { ChevronRight, Plus, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { STATUS_LABEL } from '$lib/client/labels';
	import { STORY_STATES, storyState } from '$lib/client/views/framing';
	import { storyRef, storySentence, type Story } from '$lib/modules/framing/domain/framing';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import CriteriaList from '$lib/ui/molecules/CriteriaList.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';

	let { story }: { story: Story } = $props();
	const { app, actions, overlays } = useApp();

	let open = $state(false);
	const personas = $derived(
		app.stakeholders.all.filter((s) => s.projectId === story.projectId && s.role === 'uses')
	);
	const persona = $derived(app.stakeholders.get(story.personaId));
	const tasks = $derived(app.tasks.all.filter((t) => t.storyId === story.id));
	const status = $derived(STORY_STATES[storyState(story, app.tasks.all)]);
	const TONES: Record<string, string> = {
		neutral: 'bg-sunken text-ink-2',
		plan: 'bg-plan-soft text-plan-text',
		ok: 'bg-ok-soft text-ok-text'
	};
	const ticked = $derived(story.criteria.filter((c) => c.done).length);
	const update = (changes: Partial<Story>) => actions.framing.updateStory(story.id, changes);

	/** The story's first piece of work, on the board, in its epic's module. */
	function createTask() {
		const epic = app.epics.get(story.epicId);
		const task = actions.tasks.create({
			projectId: story.projectId,
			title: story.want.charAt(0).toUpperCase() + story.want.slice(1),
			kind: 'feature',
			storyId: story.id,
			componentId: epic?.componentId ?? null
		});
		if (task) overlays.openTask(task.id);
	}
</script>

<li class="flex flex-col">
	<button
		class="flex min-h-11 items-start gap-2 rounded-lg px-1 py-2 text-left hover:bg-hover"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<ChevronRight
			size={16}
			class={['mt-1 shrink-0 text-ink-3 transition-transform', open && 'rotate-90']}
			aria-hidden="true"
		/>
		<span class="shrink-0 pt-0.5 font-mono text-xs text-ink-3"
			>{story.number ? storyRef(story) : 'US-…'}</span
		>
		<span class="min-w-0 flex-1 text-base"
			>{storySentence(story, persona?.name.toLowerCase() ?? null)}</span
		>
		<span class="flex shrink-0 items-center gap-1.5 pt-0.5">
			{#if story.criteria.length}
				<span class="text-xs text-ink-3 tabular-nums">{ticked}/{story.criteria.length}</span>
			{:else}
				<span class="rounded-md bg-warn-soft px-1.5 text-xs text-warn-text">sans critère</span>
			{/if}
			<span class={['rounded-md px-1.5 text-xs font-medium', TONES[status.tone]]}
				>{status.label}</span
			>
		</span>
	</button>

	{#if open}
		<div class="mb-3 ml-7 flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-3">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-base">
				<span class="text-ink-3">En tant que</span>
				<Select
					size="sm"
					label="Persona"
					value={story.personaId ?? ''}
					options={[
						{ value: '', label: 'utilisateur' },
						...personas.map((p) => ({ value: p.id, label: p.name.toLowerCase() }))
					]}
					onchange={(personaId) => update({ personaId: personaId || null })}
				/>
				<span class="text-ink-3">je veux</span>
				<EditableText
					label="Ce que la personne veut faire"
					value={story.want}
					maxlength={300}
					class="font-medium"
					onsave={(want) => update({ want })}
				/>
				<span class="text-ink-3">afin de</span>
				<EditableText
					label="Le bénéfice"
					value={story.soThat}
					placeholder="le bénéfice pour elle"
					allowEmpty
					maxlength={300}
					onsave={(soThat) => update({ soThat })}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<h4 class="text-xs font-semibold tracking-wide text-ink-3 uppercase">
					Critères d’acceptation
				</h4>
				<CriteriaList
					criteria={story.criteria}
					onchange={(criteria) => actions.framing.setCriteria(story.id, criteria)}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<h4 class="text-xs font-semibold tracking-wide text-ink-3 uppercase">Le travail</h4>
				{#each tasks as task (task.id)}
					<button
						class="flex min-h-9 items-center gap-2 rounded-lg px-1 text-left text-sm hover:bg-hover"
						onclick={() => overlays.openTask(task.id)}
					>
						<span class="font-mono text-ink-3">#{task.number}</span>
						<span class="min-w-0 flex-1 truncate">{task.title}</span>
						<span class="text-xs text-ink-3">{STATUS_LABEL[task.status]}</span>
					</button>
				{/each}
				<div class="flex flex-wrap gap-2">
					<Button size="sm" icon={Plus} onclick={createTask}>Créer une tâche</Button>
					<span class="flex-1"></span>
					<IconButton
						icon={Trash2}
						size="sm"
						label="Supprimer la story"
						onclick={() => actions.framing.removeStory(story)}
					/>
				</div>
			</div>
		</div>
	{/if}
</li>
