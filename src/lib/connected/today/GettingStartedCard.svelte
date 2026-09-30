<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { readFlag, writeFlag } from '$lib/client/local-flag';
	import { startSteps } from '$lib/client/views/getting-started';
	import GettingStarted from '$lib/ui/organisms/today/GettingStarted.svelte';

	const { store, me } = useProject();
	const key = $derived(`crystal-start-hidden-${store.project.id}`);
	let hidden = $state(true);
	$effect(() => void (hidden = readFlag(key)));
	const steps = $derived(
		startSteps({
			objective: store.project.objective,
			featureCount: store.features.items.length,
			taskCount: store.tasks.items.length,
			memberCount: store.members.items.length,
			myAvailabilityCount: store.availabilities.items.filter((a) => a.userId === me.id).length,
			myTaskCount: store.tasks.items.filter((t) => t.assigneeIds.includes(me.id)).length
		})
	);
	const hide = () => ((hidden = true), writeFlag(key));
</script>

{#if !hidden && steps.some((step) => !step.done)}
	<GettingStarted {steps} base="/p/{store.project.slug}" onhide={hide} />
{/if}
