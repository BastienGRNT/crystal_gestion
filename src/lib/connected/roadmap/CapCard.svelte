<script lang="ts">
	import { BookOpen, ChevronDown, Crosshair } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import BriefSections from '../framing/BriefSections.svelte';

	let { project }: { project: Project } = $props();
	const { actions } = useApp();

	// Read once, changed rarely: folding is remembered per device.
	const foldKey = () => `crystal-cap-folded-${project.id}`;
	let folded = $state(untrack(read));
	function read() {
		try {
			return localStorage.getItem(foldKey()) === '1';
		} catch {
			return false;
		}
	}
	function toggle() {
		folded = !folded;
		try {
			localStorage.setItem(foldKey(), folded ? '1' : '0');
		} catch {
			// Folded for this visit only.
		}
	}
</script>

<section
	id="cap"
	aria-labelledby="cap-title"
	class="scroll-mt-6 rounded-2xl border border-line bg-surface shadow-card"
>
	<div class="flex items-start gap-3 px-4 pt-3.5 pb-2">
		<Crosshair size={20} class="mt-2.5 shrink-0 text-accent-text" aria-hidden="true" />
		<div class="flex min-w-0 flex-1 flex-col">
			<h2 id="cap-title" class="pt-1.5 text-lg font-semibold tracking-tight">Le cap</h2>
			<EditableText
				label="Notre réponse, en une phrase"
				value={project.description}
				placeholder="Notre réponse en une phrase (elle s’affiche sous le nom du projet)"
				maxlength={300}
				class="text-base text-ink-2"
				onsave={(description) => actions.projects.update(project.id, { description })}
			/>
		</div>
		<button
			type="button"
			onclick={toggle}
			aria-expanded={!folded}
			aria-label={folded ? 'Déplier le cap' : 'Replier le cap'}
			class="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-3 hover:bg-hover hover:text-ink"
		>
			<ChevronDown
				size={18}
				class={['transition-transform', !folded && 'rotate-180']}
				aria-hidden="true"
			/>
		</button>
	</div>

	{#if !folded}
		<div class="flex flex-col gap-3 px-4 pb-4 sm:pl-[3.25rem]">
			<BriefSections {project} />
			<a
				href="/p/{project.slug}/cadrage"
				class="inline-flex items-center gap-1.5 self-start text-sm text-accent-text hover:underline"
				><BookOpen size={15} aria-hidden="true" />Toute la note de cadrage, le SWOT et les cahiers
				des charges</a
			>
		</div>
	{/if}
</section>
