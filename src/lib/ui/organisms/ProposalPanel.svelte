<script lang="ts">
	import { Check, MessageSquareText, Sparkles } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import Button from '../atoms/Button.svelte';
	import Spinner from '../atoms/Spinner.svelte';
	import TextArea from '../atoms/TextArea.svelte';
	import type { AssistantQuestion, ProposedChange } from '../types';
	import RichText from './RichText.svelte';

	interface Props {
		phase: 'loading' | 'questions' | 'proposal';
		summary: string;
		verdict: 'none' | 'realistic' | 'at_risk' | 'unrealistic';
		questions: AssistantQuestion[];
		changes: ProposedChange[];
		/** Rules the assistant broke: those changes were left out. */
		dropped: number;
		/** One correction is allowed: "demander une modification". */
		canRevise: boolean;
		/** Served from the cache, or what it cost. */
		costNote: string;
		onanswer: (answers: { question: string; answer: string }[]) => void;
		onaccept: (ids: string[], texts: Record<string, string>) => void;
		onrevise: (remark: string) => void;
		oncancel: () => void;
	}

	let {
		phase,
		summary,
		verdict,
		questions,
		changes,
		dropped,
		canRevise,
		costNote,
		onanswer,
		onaccept,
		onrevise,
		oncancel
	}: Props = $props();

	// Each question starts on the answer the assistant would pick.
	let picks = $state<Record<number, string>>({});
	let extra = $state<Record<number, string>>({});
	const ticked = new SvelteSet<string>();
	let texts = $state<Record<string, string>>({});
	let remark = $state('');
	// Seconds spent waiting, so a slow answer never looks frozen.
	let waited = $state(0);
	$effect(() => {
		if (phase !== 'loading') return;
		waited = 0;
		const timer = setInterval(() => waited++, 1000);
		return () => clearInterval(timer);
	});
	let seen = '';
	$effect.pre(() => {
		const key = changes.map((c) => c.id).join(',');
		if (key === seen) return;
		seen = key;
		ticked.clear();
		for (const c of changes) ticked.add(c.id);
		texts = Object.fromEntries(changes.filter((c) => c.text !== null).map((c) => [c.id, c.text!]));
		picks = Object.fromEntries(questions.map((q, i) => [i, q.suggested]));
		extra = {};
	});

	const VERDICTS = {
		realistic: { label: 'Réalisable', tone: 'bg-ok-soft text-ok-text' },
		at_risk: { label: 'À risque', tone: 'bg-warn-soft text-warn-text' },
		unrealistic: { label: 'Irréaliste en l’état', tone: 'bg-danger-soft text-danger-text' }
	} as const;

	function answer() {
		onanswer(
			questions.map((q, i) => ({
				question: q.text,
				answer: [picks[i], extra[i]?.trim()].filter(Boolean).join(' · ')
			}))
		);
	}
</script>

{#if phase === 'loading'}
	<div class="flex flex-col items-center gap-3 py-12 text-ink-3">
		<Spinner />
		<p class="text-base">Le chef de projet lit le projet…</p>
		{#if waited >= 5}<p class="text-sm tabular-nums">
				{waited} s{waited >= 20 ? ' · il répond en moins d’une minute, sinon il le dit' : ''}
			</p>{/if}
	</div>
{:else if phase === 'questions'}
	<div class="flex flex-col gap-5">
		{#if summary}<RichText body={summary} size="base" />{/if}
		{#each questions as question, i (i)}
			<fieldset class="flex flex-col gap-2">
				<legend class="mb-1 text-base font-semibold">{question.text}</legend>
				{#each question.options as option (option)}
					<label
						class="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 hover:bg-hover"
					>
						<input
							type="radio"
							name="q-{i}"
							value={option}
							checked={picks[i] === option}
							onchange={() => (picks[i] = option)}
							class="size-4 accent-[var(--color-accent)]"
						/>
						<span class="text-base">{option}</span>
						{#if option === question.suggested}<span class="text-xs text-ink-3">proposé</span>{/if}
					</label>
				{/each}
				<input
					bind:value={extra[i]}
					aria-label="Autre chose à ajouter"
					placeholder="Autre chose à ajouter ?"
					maxlength={500}
					class="h-11 rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
				/>
			</fieldset>
		{/each}
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={oncancel}>Annuler</Button>
			<Button variant="primary" icon={Sparkles} onclick={answer}>Voir la proposition</Button>
		</div>
	</div>
{:else}
	<div class="flex flex-col gap-4">
		{#if verdict !== 'none'}
			<span
				class={['self-start rounded-lg px-2.5 py-1 text-sm font-semibold', VERDICTS[verdict].tone]}
				>{VERDICTS[verdict].label}</span
			>
		{/if}
		{#if summary}<div class="rounded-xl bg-surface-2 px-4 py-3">
				<RichText body={summary} size="base" />
			</div>{/if}

		{#if changes.length}
			<p class="text-sm text-ink-3">
				Coche ce que tu gardes, réécris si besoin, puis applique. Rien ne change avant.
			</p>
			<ul class="flex flex-col gap-2">
				{#each changes as change (change.id)}
					<li
						class={[
							'flex gap-3 rounded-xl border px-3 py-2.5',
							ticked.has(change.id)
								? 'border-accent/40 bg-surface'
								: 'border-line bg-surface-2 opacity-70'
						]}
					>
						<input
							type="checkbox"
							checked={ticked.has(change.id)}
							aria-label="Garder : {change.label}"
							onchange={(e) =>
								e.currentTarget.checked ? ticked.add(change.id) : ticked.delete(change.id)}
							class="mt-1.5 size-[18px] shrink-0 accent-[var(--color-accent)]"
						/>
						<div class="flex min-w-0 flex-1 flex-col gap-1">
							<span class="text-xs font-semibold tracking-wide text-accent-text uppercase"
								>{change.label}</span
							>
							{#if change.text !== null}
								<TextArea
									bind:value={texts[change.id]}
									aria-label="Texte de : {change.label}"
									rows={1}
									maxHeight={220}
									class="text-base"
								/>
							{/if}
							{#each change.details as line, i (i)}<p class="text-sm text-ink-2">{line}</p>{/each}
							{#if change.reason}<p class="text-sm text-ink-3">Pourquoi : {change.reason}</p>{/if}
							{#if change.sources.length}<p class="text-xs text-ink-3">
									Sources : {change.sources.join(' · ')}
								</p>{/if}
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-base text-ink-2">Rien à proposer : c’est une réponse valable.</p>
		{/if}
		{#if dropped}
			<p class="text-xs text-ink-3">
				{dropped} proposition{dropped > 1 ? 's' : ''} écartée{dropped > 1 ? 's' : ''} : hors des règles
				(suppression, assignation, date sans pourquoi…).
			</p>
		{/if}

		{#if canRevise}
			<div class="flex flex-col gap-2 rounded-xl border border-line px-3 py-2.5">
				<label for="remark" class="flex items-center gap-1.5 text-sm font-medium text-ink-2"
					><MessageSquareText size={15} />Demander une modification (une seule fois)</label
				>
				<div class="flex flex-wrap gap-2">
					<input
						id="remark"
						bind:value={remark}
						maxlength={1000}
						placeholder="Ex. : moins de tâches, et pas de paiement avant la bêta"
						class="h-10 min-w-0 flex-1 rounded-lg border border-line-strong/70 bg-surface px-3 text-base outline-none focus:border-accent"
					/>
					<Button size="sm" disabled={!remark.trim()} onclick={() => onrevise(remark.trim())}
						>Corriger</Button
					>
				</div>
			</div>
		{/if}

		<div class="flex flex-wrap items-center justify-end gap-2">
			<span class="mr-auto text-xs text-ink-3">{costNote}</span>
			<Button variant="ghost" onclick={oncancel}>Abandonner</Button>
			{#if changes.length}
				<Button
					variant="primary"
					icon={Check}
					disabled={!ticked.size}
					onclick={() => onaccept([...ticked], texts)}
					>Appliquer {ticked.size} changement{ticked.size > 1 ? 's' : ''}</Button
				>
			{/if}
		</div>
	</div>
{/if}
