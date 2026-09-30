<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { DraftKind } from '$lib/client/views/journal-draft';
	import IconButton from '../../atoms/IconButton.svelte';
	import Select from '../../atoms/Select.svelte';
	import JournalKindBadge from './JournalKindBadge.svelte';

	interface Props {
		kind: DraftKind;
		featureId: string;
		featureOptions: { value: string; label: string }[];
		oncancel: () => void;
	}

	let { kind, featureId = $bindable(), featureOptions, oncancel }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<JournalKindBadge {kind} />
	<Select
		label="Feature"
		value={featureId}
		options={featureOptions}
		onchange={(id) => (featureId = id)}
		class="max-w-56 min-w-0 text-ink-2"
	/>
	<IconButton label="Annuler (Échap)" size="sm" class="ml-auto" onclick={oncancel}>
		<X size={14} />
	</IconButton>
</div>
