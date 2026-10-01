<script lang="ts">
	import { useProject } from '$lib/client/context';
	import IdeaCapture from '$lib/ui/organisms/ideas/IdeaCapture.svelte';

	const { actions } = useProject();
</script>

<IdeaCapture oncapture={(title) => actions.ideas.create({ title })} />
<p class="mt-2 px-1 text-xs text-ink-3">
	Hors produit : quelqu’un à contacter, une piste à creuser. Une idée pour le produit va dans
	l’Icebox des Tâches. Partout, la touche <span class="font-mono">I</span> fait la même chose.
</p>
