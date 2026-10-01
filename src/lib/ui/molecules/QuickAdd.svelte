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
	class="flex h-[38px] items-center gap-2.5 rounded-lg px-2.5 text-ink-3 transition focus-within:text-ink hover:bg-hover"
>
	<Plus size={15} />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value
		{placeholder}
		{autofocus}
		onkeydown={(event) => event.key === 'Enter' && submit()}
		class="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
	/>
</label>
