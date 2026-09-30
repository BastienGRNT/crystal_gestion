<script lang="ts">
	import { ArrowRight, Check, X } from '@lucide/svelte';
	import type { StartStep } from '$lib/client/views/getting-started';
	import ProgressBar from '../../atoms/ProgressBar.svelte';

	interface Props {
		steps: StartStep[];
		base: string;
		onhide: () => void;
	}

	let { steps, base, onhide }: Props = $props();
	const done = $derived(steps.filter((step) => step.done).length);
	const next = $derived(steps.find((step) => !step.done));
</script>

<section
	class="mb-10 rounded-xl border border-accent/25 bg-surface p-5 shadow-card sm:p-6"
	aria-labelledby="start-title"
>
	<header class="mb-4 flex items-start gap-4">
		<div class="min-w-0 flex-1">
			<h2 id="start-title" class="text-xl font-semibold">Pour bien démarrer</h2>
			<p class="mt-1 text-ink-2">
				{done} sur {steps.length} · chaque étape se coche toute seule quand c’est fait.
			</p>
		</div>
		<button
			class="rounded-md p-1.5 text-ink-3 hover:bg-sunken hover:text-ink"
			aria-label="Masquer le guide"
			title="Masquer"
			onclick={onhide}><X size={16} /></button
		>
	</header>
	<ProgressBar ratio={done / steps.length} label="Avancement du démarrage" />
	<ol class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
		{#each steps as step (step.key)}
			<li>
				<a
					href="{base}{step.path}"
					class="group flex h-full gap-3 rounded-lg border p-3 transition {step === next
						? 'border-accent bg-accent-soft/40'
						: 'border-line hover:border-line-strong'}"
				>
					<span
						class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border {step.done
							? 'border-success bg-success text-accent-ink'
							: 'border-line-strong'}"
					>
						{#if step.done}<Check size={12} strokeWidth={3} />{/if}
					</span>
					<span class="min-w-0">
						<span class="block font-medium {step.done ? 'text-ink-3 line-through' : ''}"
							>{step.label}</span
						>
						{#if !step.done}<span class="mt-0.5 block text-sm text-ink-2">{step.hint}</span>{/if}
					</span>
					{#if step === next}<ArrowRight
							size={16}
							class="ml-auto shrink-0 self-center text-accent"
						/>{/if}
				</a>
			</li>
		{/each}
	</ol>
</section>
