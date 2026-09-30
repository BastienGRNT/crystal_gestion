<script lang="ts">
	import { useProject } from '$lib/client/context';
	import DateInput from '$lib/ui/atoms/DateInput.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import FramingField from '$lib/ui/organisms/project/FramingField.svelte';

	const { store, actions, refs } = useProject();
	const project = $derived(store.project);
	const save = actions.project.updateFraming;
</script>

<div class="border-b border-line">
	<FramingField label="Objectif">
		<InlineText value={project.objective} required={false} placeholder="L’objectif en une phrase" onsave={(objective) => save({ objective })} class="py-1 font-display text-[22px] leading-snug" />
	</FramingField>
	<FramingField label="Pour qui">
		<InlineText value={project.audience} required={false} placeholder="La cible, les utilisateurs" onsave={(audience) => save({ audience })} class="py-1" />
	</FramingField>
	<FramingField label="Date limite">
		<DateInput label="Date limite" value={project.deadline} onchange={(deadline) => save({ deadline })} />
	</FramingField>
	<FramingField label="Hors périmètre">
		<InlineRichText value={project.outOfScope} resolve={refs.resolve} suggest={refs.suggest} placeholder="Ce qu’on ne fera pas" onsave={(outOfScope) => save({ outOfScope })} />
	</FramingField>
	<FramingField label="C’est fini quand…">
		<InlineRichText value={project.doneDefinition} resolve={refs.resolve} suggest={refs.suggest} placeholder="La définition de « fini »" onsave={(doneDefinition) => save({ doneDefinition })} />
	</FramingField>
</div>
