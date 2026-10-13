<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';

	let { channelId }: { channelId: string } = $props();
	const { app } = useApp();
	let tick = $state(Date.now());

	$effect(() => {
		const timer = setInterval(() => (tick = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const names = $derived(
		[...app.typing.entries()]
			.filter(([key, until]) => key.startsWith(`${channelId}:`) && until > tick)
			.map(([key]) => app.users.get(key.split(':')[1]))
			.flatMap((user) => (user ? [firstName(user.name)] : []))
	);
</script>

<p class="h-5 px-6 text-sm text-ink-3" aria-live="polite">
	{#if names.length}
		<span class="inline-flex items-center gap-1.5">
			<span class="flex gap-0.5" aria-hidden="true">
				{#each [0, 1, 2] as dot (dot)}
					<span
						class="size-1 animate-bounce rounded-full bg-ink-3"
						style:animation-delay="{dot * 120}ms"
					></span>
				{/each}
			</span>
			{names.join(' et ')}
			{names.length > 1 ? 'écrivent' : 'écrit'}…
		</span>
	{/if}
</p>
