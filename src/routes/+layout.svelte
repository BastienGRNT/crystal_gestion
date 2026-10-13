<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Crystal</title>
</svelte:head>

{@render children()}
