<script lang="ts">
	import { Check } from '@lucide/svelte';

	interface Props {
		checked: boolean;
		label: string;
		onchange: (checked: boolean) => void;
	}

	let { checked, label, onchange }: Props = $props();
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={checked}
	aria-label={label}
	onclick={(event) => {
		event.stopPropagation();
		onchange(!checked);
	}}
	class="inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition duration-200 {checked
		? 'border-success bg-success text-white'
		: 'border-line-strong text-transparent hover:border-success hover:text-success/60'}"
>
	<Check size={11} strokeWidth={3.5} />
</button>
