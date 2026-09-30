<script lang="ts">
	let { message }: { message?: string | null } = $props();
</script>

{#if message}
	<p
		class="rounded-md border border-danger/30 bg-danger/8 px-3 py-2 text-sm text-danger"
		role="alert"
	>
		{message}
	</p>
{/if}
