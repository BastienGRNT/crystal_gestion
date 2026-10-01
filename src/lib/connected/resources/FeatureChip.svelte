<script lang="ts">
	import { useProject } from '$lib/client/context';
	import ChipSelect from '$lib/ui/molecules/ChipSelect.svelte';
	import { featureOptions } from './options';

	interface Props {
		value: string | null;
		onchange: (featureId: string | null) => void;
		placeholder?: string;
	}

	let { value, onchange, placeholder = 'Sans Feat' }: Props = $props();
	const { store } = useProject();
</script>

<ChipSelect
	label="Feat"
	value={value ?? ''}
	options={featureOptions(store.features.items)}
	onchange={(id) => onchange(id || null)}
	{placeholder}
/>
