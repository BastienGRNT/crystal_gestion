<script lang="ts">
	import { SendHorizontal } from '@lucide/svelte';
	import QuestionToggle from './QuestionToggle.svelte';

	interface Props {
		question: boolean;
		canAsk: boolean;
		canSend: boolean;
		onquestion: (question: boolean) => void;
		onsubmit: () => void;
	}

	/** Only what is useful now: « attendre sa réponse » shows up once someone is mentioned. */
	let { question, canAsk, canSend, onquestion, onsubmit }: Props = $props();
</script>

<div class="flex items-center gap-2 px-2 pb-2">
	{#if canAsk}<QuestionToggle pressed={question} disabled={false} onchange={onquestion} />{/if}
	<button
		type="button"
		disabled={!canSend}
		onclick={onsubmit}
		aria-label="Envoyer (Entrée)"
		title="Envoyer (Entrée)"
		class="ml-auto flex size-8 items-center justify-center rounded-lg bg-accent text-accent-ink transition hover:brightness-110 disabled:opacity-35"
		><SendHorizontal size={15} /></button
	>
</div>
