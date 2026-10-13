<script lang="ts">
	let { size = 28, wordmark = true }: { size?: number; wordmark?: boolean } = $props();
	const id = `gem-${Math.random().toString(36).slice(2, 8)}`;
</script>

<span class="inline-flex items-center gap-2.5">
	<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
		<defs>
			<linearGradient {id} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#8b6cff" />
				<stop offset="1" stop-color="#4f7bff" />
			</linearGradient>
		</defs>
		<rect width="32" height="32" rx="9" fill="url(#{id})" />
		<path d="M16 6.5 24 13l-8 12.5L8 13z" fill="#fff" fill-opacity=".95" />
		<path d="M8 13h16l-8 12.5z" fill="#fff" fill-opacity=".55" />
	</svg>
	{#if wordmark}<span class="text-[17px] font-semibold tracking-tight">Crystal</span>{/if}
</span>
