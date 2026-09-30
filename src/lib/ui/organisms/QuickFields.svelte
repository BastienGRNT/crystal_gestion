<script lang="ts">
	import Input from '../atoms/Input.svelte';
	import type { QuickField } from '../types';

	interface Props {
		fields: QuickField[];
		values: Record<string, string>;
		oninput: (key: string, value: string) => void;
	}

	let { fields, values, oninput }: Props = $props();
</script>

{#if fields.length}
	<div class="mt-3 grid gap-2 sm:grid-cols-2">
		{#each fields as field (field.key)}
			<Input
				aria-label={field.label}
				placeholder={field.placeholder ?? field.label}
				type={field.type ?? 'text'}
				autocomplete="off"
				value={values[field.key] ?? ''}
				oninput={(event) => oninput(field.key, event.currentTarget.value)}
				class="h-8 text-sm {field.wide ? 'sm:col-span-2' : ''} {field.mono
					? 'font-mono text-sm'
					: ''}"
			/>
		{/each}
	</div>
{/if}
