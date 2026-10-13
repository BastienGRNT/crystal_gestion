<script lang="ts">
	let { keys, tone = 'default' }: { keys: string; tone?: 'default' | 'inverse' } = $props();
</script>

<kbd
	class={[
		'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 font-mono text-[11px] leading-none font-medium',
		tone === 'inverse' ? 'bg-white/15 text-current' : 'border border-line bg-surface-2 text-ink-3'
	]}>{keys}</kbd
>
