<script lang="ts">
	import Button from '../../atoms/Button.svelte';
	import Kbd from '../../atoms/Kbd.svelte';

	let { canSave, oncancel }: { canSave: boolean; oncancel: () => void } = $props();
</script>

<footer class="mt-4 flex items-center justify-end gap-2 border-t border-line pt-3">
	<span class="mr-auto hidden items-center gap-1 text-xs text-ink-3 sm:flex">
		<Kbd>⌘</Kbd><Kbd>↵</Kbd> enregistrer · <span class="font-mono">#</span> lier un élément
	</span>
	<Button variant="ghost" size="sm" onclick={oncancel}>Annuler</Button>
	<Button variant="primary" size="sm" type="submit" disabled={!canSave}>Enregistrer</Button>
</footer>
