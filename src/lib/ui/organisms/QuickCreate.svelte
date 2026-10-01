<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Plus } from '@lucide/svelte';
	import FormField from '../molecules/form/FormField.svelte';
	import TextField from '../molecules/form/TextField.svelte';
	import type { QuickField } from '../types';
	import FormDialog from './FormDialog.svelte';

	interface Props {
		label: string;
		/** The first field is the required name; the others are optional. */
		fields: [QuickField, ...QuickField[]];
		onsubmit: (values: Record<string, string>) => Promise<unknown>;
		open?: boolean;
		/** More questions under the fields (the feat it belongs to…). */
		extra?: Snippet;
		submitLabel?: string;
	}

	let {
		label,
		fields,
		onsubmit,
		open = $bindable(false),
		extra,
		submitLabel = 'Ajouter'
	}: Props = $props();
	let values = $state<Record<string, string>>({});
	const [head, ...rest] = $derived(fields);
	const close = () => ((open = false), (values = {}));

	async function submit() {
		const title = values[head.key]?.trim();
		if (!title) return;
		const sent = { ...values, [head.key]: title };
		close();
		await onsubmit(sent);
	}
</script>

<button
	type="button"
	onclick={() => (open = true)}
	class="mb-5 flex h-14 w-full items-center gap-3 rounded-[16px] border-[1.5px] border-dashed border-line-strong px-5 text-[15px] font-bold text-ink-2 transition hover:border-ink-3 hover:bg-surface hover:text-ink"
>
	<Plus size={18} />{label}
</button>
{#if open}
	<FormDialog
		title={label}
		{submitLabel}
		disabled={!values[head.key]?.trim()}
		onsubmit={submit}
		onclose={close}
		width="max-w-[560px]"
	>
		{#each [head, ...rest] as field, i (field.key)}
			<FormField label={field.label} optional={i > 0}>
				<TextField
					main={i === 0}
					type={field.type ?? 'text'}
					mono={field.mono}
					placeholder={field.placeholder?.replace(/^.*? — /, 'Ex. ') ?? ''}
					bind:value={values[field.key]}
				/>
			</FormField>
		{/each}
		{@render extra?.()}
	</FormDialog>
{/if}
