<script lang="ts">
	let { size = 22 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
	<defs>
		<linearGradient id="crystal-logo" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#3d2bff" />
			<stop offset=".45" stop-color="#c13bff" />
			<stop offset=".75" stop-color="#ff4d6d" />
			<stop offset="1" stop-color="#ffb020" />
		</linearGradient>
	</defs>
	<path d="M16 2 28 12 16 30 4 12Z" fill="url(#crystal-logo)" />
	<path
		d="M4 12h24M16 2l-5 10 5 18 5-18z"
		fill="none"
		stroke="#fff"
		stroke-opacity=".55"
		stroke-width="1.2"
	/>
</svg>
