<script lang="ts">
	let { label }: { label: string } = $props();
</script>

<div class="my-5 flex items-center gap-3 px-4 sm:px-6" role="separator">
	<span class="h-px flex-1 bg-line"></span>
	<span class="font-mono text-2xs tracking-[0.14em] text-ink-3 uppercase">{label}</span>
	<span class="h-px flex-1 bg-line"></span>
</div>
