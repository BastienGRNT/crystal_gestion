<script lang="ts">
	import { SendHorizontal } from '@lucide/svelte';
	import Button from '../atoms/Button.svelte';
	import Kbd from '../atoms/Kbd.svelte';
	import QuestionToggle from './QuestionToggle.svelte';

	interface Props {
		question: boolean;
		canAsk: boolean;
		canSend: boolean;
		onquestion: (question: boolean) => void;
		onsubmit: () => void;
	}

	let { question, canAsk, canSend, onquestion, onsubmit }: Props = $props();
</script>

<div class="flex items-center gap-2 px-2 pt-1 pb-2">
	<QuestionToggle pressed={question} disabled={!canAsk} onchange={onquestion} />
	<span class="hidden items-center gap-1 text-xs text-ink-3 lg:inline-flex">
		<Kbd>#</Kbd> lier <Kbd>@</Kbd> mentionner <Kbd>⇧ ⏎</Kbd> nouvelle ligne
	</span>
	<Button variant="primary" size="sm" class="ml-auto" disabled={!canSend} onclick={onsubmit}>
		<SendHorizontal size={13} /> Envoyer
	</Button>
</div>
