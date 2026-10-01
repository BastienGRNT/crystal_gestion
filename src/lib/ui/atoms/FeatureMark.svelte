<script lang="ts">
	/** A feature as metadata: its color square and its name, never a pill. */
	let {
		title,
		color,
		muted = false
	}: { title: string | null; color: string; muted?: boolean } = $props();
</script>

<span class="inline-flex min-w-0 items-center gap-2 text-ui {muted ? 'text-ink-3' : 'text-ink-2'}">
	<span class="size-2.5 shrink-0 rounded-[3px]" style="background:{color}"></span>
	<span class="truncate">{title ?? 'Sans Feat'}</span>
</span>
