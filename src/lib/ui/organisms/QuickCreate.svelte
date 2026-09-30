<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../atoms/Button.svelte';
	import AddRow from '../molecules/AddRow.svelte';
	import type { QuickField } from '../types';
	import QuickFields from './QuickFields.svelte';

	interface Props {
		label: string;
		fields: [QuickField, ...QuickField[]];
		onsubmit: (values: Record<string, string>) => Promise<unknown>;
		open?: boolean;
		extra?: Snippet;
	}

	let { label, fields, onsubmit, open = $bindable(false), extra }: Props = $props();
	let values = $state<Record<string, string>>({});
	let busy = $state(false);
	const [head, ...rest] = $derived(fields);
	const close = () => ((open = false), (values = {}));

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const title = values[head.key]?.trim();
		if (!title || busy) return;
		busy = true;
		await onsubmit({ ...values, [head.key]: title });
		busy = false;
		close();
	}
</script>

{#if open}
	<!-- Escape bubbles up from any input of the form: one listener closes it. -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form
		novalidate
		onsubmit={submit}
		onkeydown={(event) => event.key === 'Escape' && close()}
		class="animate-rise rounded-lg border border-accent/50 bg-surface p-4 shadow-pop"
	>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autofocus
			aria-label={head.label}
			placeholder={head.placeholder ?? head.label}
			value={values[head.key] ?? ''}
			oninput={(event) => (values[head.key] = event.currentTarget.value)}
			class="w-full bg-transparent font-display text-3xl leading-tight outline-none placeholder:text-ink-3/70"
		/>
		<QuickFields fields={rest} {values} oninput={(key, value) => (values[key] = value)} />
		<div class="mt-4 flex flex-wrap items-center gap-2">
			{@render extra?.()}
			<Button variant="ghost" size="sm" class="ml-auto" onclick={close}>Annuler</Button>
			<Button variant="primary" size="sm" type="submit" loading={busy}>Créer</Button>
		</div>
	</form>
{:else}
	<AddRow {label} onclick={() => (open = true)} />
{/if}
