<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { openFeats } from '$lib/client/views/open-feats';
	import FeatChoice from '$lib/ui/molecules/form/FeatChoice.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';

	interface Props {
		value: string | null;
		onchange: (featureId: string | null) => void;
	}

	/** « Pour quelle Feat ? » in a creation form. */
	let { value, onchange }: Props = $props();
	const { store } = useProject();
</script>

<FormField label="Pour quelle Feat ?" optional>
	<FeatChoice feats={openFeats(store.features.items)} {value} {onchange} />
</FormField>
