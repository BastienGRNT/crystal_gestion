<script lang="ts">
	import { FlaskConical, Trash2 } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import IconButton from '../atoms/IconButton.svelte';
	import type { CriterionItem } from '../types';
	import EditableText from './EditableText.svelte';
	import InlineAdd from './InlineAdd.svelte';

	interface Props {
		criteria: CriterionItem[];
		onchange: (criteria: CriterionItem[]) => void;
		/** Only the ticking, for a task sheet: the wording lives in the spec. */
		tickOnly?: boolean;
	}

	let { criteria, onchange, tickOnly = false }: Props = $props();
	const opened = new SvelteSet<string>();

	const edit = (id: string, changes: Partial<CriterionItem>) =>
		onchange(criteria.map((c) => (c.id === id ? { ...c, ...changes } : c)));
	const add = (text: string) =>
		onchange([...criteria, { id: crypto.randomUUID(), text, done: false, data: '', expected: '' }]);
</script>

<ul class="flex flex-col gap-1">
	{#each criteria as criterion (criterion.id)}
		<li class="flex flex-col gap-1">
			<div class="flex items-start gap-2">
				<label class="flex size-10 shrink-0 cursor-pointer items-center justify-center">
					<input
						type="checkbox"
						checked={criterion.done}
						aria-label="Vérifié : {criterion.text}"
						onchange={(e) => edit(criterion.id, { done: e.currentTarget.checked })}
						class="size-[18px] accent-[var(--color-ok)]"
					/>
				</label>
				{#if tickOnly}
					<p class={['min-w-0 flex-1 pt-2 text-base', criterion.done && 'text-ink-3']}>
						{criterion.text}
					</p>
				{:else}
					<EditableText
						label="Critère"
						value={criterion.text}
						maxlength={300}
						class={['flex-1 text-base', criterion.done ? 'text-ink-3' : ''].join(' ')}
						onsave={(text) => edit(criterion.id, { text })}
					/>
					<IconButton
						icon={FlaskConical}
						size="sm"
						active={opened.has(criterion.id) || !!(criterion.data || criterion.expected)}
						label="Jeu de données de test"
						onclick={() =>
							opened.has(criterion.id) ? opened.delete(criterion.id) : opened.add(criterion.id)}
					/>
					<IconButton
						icon={Trash2}
						size="sm"
						label="Retirer le critère"
						onclick={() => onchange(criteria.filter((c) => c.id !== criterion.id))}
					/>
				{/if}
			</div>
			{#if (opened.has(criterion.id) && !tickOnly) || (tickOnly && (criterion.data || criterion.expected))}
				<dl class="ml-12 grid gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[130px_minmax(0,1fr)]">
					<dt class="pt-2 text-ink-3">Données</dt>
					<dd>
						{#if tickOnly}<p class="pt-2">{criterion.data || '—'}</p>{:else}<EditableText
								label="Données de test"
								value={criterion.data}
								placeholder="Ex. : créneau du 12/11 à 9 h, Paul Martin"
								allowEmpty
								maxlength={1000}
								onsave={(data) => edit(criterion.id, { data })}
							/>{/if}
					</dd>
					<dt class="pt-2 text-ink-3">Résultat attendu</dt>
					<dd>
						{#if tickOnly}<p class="pt-2">{criterion.expected || '—'}</p>{:else}<EditableText
								label="Résultat attendu"
								value={criterion.expected}
								placeholder="Ex. : RDV créé, SMS reçu en moins d’une minute"
								allowEmpty
								maxlength={500}
								onsave={(expected) => edit(criterion.id, { expected })}
							/>{/if}
					</dd>
				</dl>
			{/if}
		</li>
	{/each}
</ul>
{#if !tickOnly}
	<InlineAdd
		label="Ajouter un critère d’acceptation"
		placeholder="Étant donné…, quand…, alors…"
		onadd={(text) => add(text)}
	/>
{/if}
