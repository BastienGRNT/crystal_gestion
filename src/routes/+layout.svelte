<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toaster from '$lib/ui/organisms/Toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Crystal</title>
</svelte:head>

{@render children()}
<Toaster />
