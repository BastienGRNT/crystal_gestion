<script lang="ts">
	import Logo from '$lib/ui/atoms/Logo.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 py-10">
	<div
		class="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,var(--accent-soft),transparent)]"
	></div>
	<div class="relative w-full max-w-[400px]">
		<div class="mb-8 flex justify-center"><Logo size={34} /></div>
		<div class="rounded-2xl border border-line bg-surface p-6 shadow-raise sm:p-8">
			{@render children()}
		</div>
		<p class="mt-6 text-center text-sm text-ink-3">
			Tâches, discussion, fichiers et planning de l’équipe, au même endroit.
		</p>
	</div>
</div>
