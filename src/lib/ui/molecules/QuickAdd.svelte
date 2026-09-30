<script lang="ts">
	import { Plus } from '@lucide/svelte';

	interface Props {
		placeholder: string;
		onadd: (title: string) => void;
		autofocus?: boolean;
	}

	let { placeholder, onadd, autofocus = false }: Props = $props();
	let value = $state('');

	function submit() {
		if (!value.trim()) return;
		onadd(value.trim());
		value = '';
	}
</script>

<label
	class="flex h-9 items-center gap-2 rounded-lg border border-dashed border-line px-3 text-sm text-ink-3 transition focus-within:border-accent focus-within:bg-surface focus-within:text-ink hover:border-line-strong"
>
	<Plus size={14} />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value
		{placeholder}
		{autofocus}
		onkeydown={(event) => event.key === 'Enter' && submit()}
		class="h-full flex-1 bg-transparent outline-none placeholder:text-ink-3"
	/>
</label>
