<script lang="ts">
	import { Upload } from '@lucide/svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		onfiles: (files: File[]) => void;
		label?: string;
		variant?: 'primary' | 'secondary';
	}

	let { onfiles, label = 'Envoyer des fichiers', variant = 'primary' }: Props = $props();
	let input: HTMLInputElement;

	function pick() {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length) onfiles(files);
	}
</script>

<input bind:this={input} type="file" multiple class="hidden" onchange={pick} />
<Button {variant} size="sm" onclick={() => input.click()}><Upload size={13} />{label}</Button>
