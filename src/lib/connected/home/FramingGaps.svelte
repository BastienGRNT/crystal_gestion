<script lang="ts">
	import AskPm from '../assistant/AskPm.svelte';
	import { BookOpen, X } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { framingGaps } from '$lib/client/views/framing';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import { framedOf } from '../framing/framed';

	let { project }: { project: Project } = $props();
	const { app } = useApp();

	const gaps = $derived(framingGaps(framedOf(app, project)));
	// "Plus tard" hides these holes on this device; a new hole shows the card again.
	const signature = $derived(gaps.map((g) => g.text).join('|'));
	const key = () => `crystal-gaps-${project.id}`;
	let dismissed = $state(untrack(read));
	function read() {
		try {
			return localStorage.getItem(key());
		} catch {
			return null;
		}
	}
	function dismiss() {
		dismissed = signature;
		try {
			localStorage.setItem(key(), signature);
		} catch {
			// Hidden for this visit only.
		}
	}
	const base = $derived(`/p/${project.slug}`);
</script>

{#if gaps.length && dismissed !== signature}
	<section
		aria-label="Ce qui manque au cadrage"
		class="flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
	>
		<BookOpen size={18} class="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<p class="text-base font-semibold">Pour que tout le monde comprenne le projet</p>
			<ul class="flex flex-col gap-0.5">
				{#each gaps as gap (gap.kind)}
					<li>
						<a
							href="{base}{gap.path}"
							class="text-base text-ink-2 hover:text-accent-text hover:underline">{gap.text}</a
						>
					</li>
				{/each}
			</ul>
			{#if gaps.some((g) => g.kind === 'brief')}<div class="mt-1 self-start">
					<AskPm projectId={project.id} action="completeFraming" />
				</div>{/if}
		</div>
		<IconButton icon={X} label="Plus tard" size="sm" onclick={dismiss} />
	</section>
{/if}
