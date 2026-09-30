<script lang="ts">
	import { CircleHelp } from '@lucide/svelte';

	interface Props {
		pressed: boolean;
		disabled: boolean;
		onchange: (pressed: boolean) => void;
	}

	let { pressed, disabled, onchange }: Props = $props();
	const active = $derived(pressed && !disabled);
</script>

<button
	type="button"
	aria-pressed={active}
	{disabled}
	title={disabled
		? 'Mentionne quelqu’un avec @ pour lui poser une question'
		: 'Chaque personne mentionnée devra répondre'}
	onclick={() => onchange(!pressed)}
	class="inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] transition disabled:cursor-not-allowed disabled:opacity-45 {active
		? 'border-should/50 bg-should/14 font-medium text-should'
		: 'border-line text-ink-3 enabled:hover:border-line-strong enabled:hover:text-ink-2'}"
>
	<CircleHelp size={13} /> Question
</button>
