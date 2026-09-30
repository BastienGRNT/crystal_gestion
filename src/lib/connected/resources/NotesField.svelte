<script lang="ts">
	import { StickyNote } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';

	let { value, onsave }: { value: string; onsave: (notes: string) => void } = $props();
	const { refs } = useProject();
</script>

<div class="flex gap-2.5" title="Notes">
	<StickyNote size={14} class="mt-2 shrink-0 text-ink-3" />
	<div class="min-w-0 flex-1">
		<InlineRichText
			{value}
			{onsave}
			resolve={refs.resolve}
			suggest={refs.suggest}
			placeholder="Notes"
			class="text-sm text-ink-2"
		/>
	</div>
</div>
