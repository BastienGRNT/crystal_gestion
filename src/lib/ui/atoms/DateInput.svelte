<script lang="ts">
	interface Props {
		value: string | null;
		onchange: (value: string | null) => void;
		label: string;
	}

	let { value, onchange, label }: Props = $props();
</script>

<input
	type="date"
	aria-label={label}
	value={value ?? ''}
	onchange={(event) => onchange(event.currentTarget.value || null)}
	class="h-8 rounded-md border border-transparent bg-transparent px-2 text-[13px] transition outline-none hover:border-line hover:bg-surface focus:border-accent {value
		? 'text-ink'
		: 'text-ink-3'}"
/>
