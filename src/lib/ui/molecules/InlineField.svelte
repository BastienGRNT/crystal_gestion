<script lang="ts">
	import TextArea from '../atoms/TextArea.svelte';

	interface Props {
		label: string;
		value: string;
		placeholder: string;
		maxlength: number;
		/** Called on leaving the field, only when the text changed. */
		onsave: (value: string) => void;
		/** Several lines allowed (Shift+Entrée), like a list. */
		multiline?: boolean;
	}

	let { label, value, placeholder, maxlength, onsave, multiline = false }: Props = $props();
	let draft = $state('');
	let editing = $state(false);
	// What is being typed is never replaced by a live update.
	$effect(() => {
		if (!editing) draft = value;
	});

	function save() {
		editing = false;
		if (draft.trim() !== value) onsave(draft);
	}
</script>

<label class="flex flex-col gap-1">
	<span class="text-sm font-semibold text-ink-2">{label}</span>
	<TextArea
		bind:value={draft}
		{maxlength}
		{placeholder}
		maxHeight={240}
		class="min-h-11"
		onfocus={() => (editing = true)}
		onblur={save}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				draft = value;
				e.currentTarget.blur();
			}
			if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
				e.preventDefault();
				e.currentTarget.blur();
			}
		}}
	/>
</label>
