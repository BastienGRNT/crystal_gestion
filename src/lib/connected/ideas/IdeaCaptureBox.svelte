<script lang="ts">
	import { useProject } from '$lib/client/context';
	import IdeaCapture from '$lib/ui/organisms/ideas/IdeaCapture.svelte';

	const { actions } = useProject();
</script>

<IdeaCapture oncapture={(title) => actions.ideas.create({ title })} />
<p class="mt-2 px-1 text-[12px] text-ink-3">
	Juste le titre, on détaillera plus tard. Ailleurs dans l’app, la touche
	<span class="font-mono">I</span> fait la même chose.
</p>
