<script lang="ts">
	import { overlays } from '$lib/client/overlays.svelte';
	import FeatForm from './FeatForm.svelte';
	import IdeaForm from './IdeaForm.svelte';
	import TaskForm from './TaskForm.svelte';

	/** One form per kind, opened from the button or key of the place you are in. */
	const kind = $derived(overlays.create?.kind);
</script>

{#if kind === 'feature'}<FeatForm />
{:else if kind === 'idea'}<IdeaForm />
{:else if kind}<TaskForm />{/if}
