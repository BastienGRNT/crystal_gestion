<script lang="ts">
	import { onMount } from 'svelte';

	let { since }: { since: string } = $props();
	let now = $state(Date.now());

	onMount(() => {
		const timer = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(timer);
	});

	const text = $derived.by(() => {
		const seconds = Math.max(0, Math.floor((now - Date.parse(since)) / 1000));
		const pad = (value: number) => String(value).padStart(2, '0');
		const hours = Math.floor(seconds / 3600);
		const clock = `${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
		return hours ? `${hours}:${clock}` : clock;
	});
</script>

<span class="font-mono tabular-nums">{text}</span>
