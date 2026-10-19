<script lang="ts">
	import Avatar from '$lib/ui/atoms/Avatar.svelte';

	interface Props {
		name: string;
		/** Shown after the name (« toi »). */
		suffix?: string;
		colorIndex: number;
		color: string;
		/** Minutes. */
		available: number;
		planned: number;
		free: number;
		/** Free minutes still ahead this week. */
		ahead: number;
		/** Usual length of their tasks with no slot this week. */
		left: number;
		/** Where to choose what to push back when it does not fit. */
		overflowHref: string;
		label: (minutes: number) => string;
		/** "SaaS 8 h, Client X 4 h" when the work spreads over several projects. */
		detail: string;
	}

	let {
		name,
		suffix = '',
		colorIndex,
		color,
		available,
		planned,
		free,
		ahead,
		left,
		overflowHref,
		label,
		detail
	}: Props = $props();
	const scale = $derived(Math.max(available, planned, 1));
	const busy = $derived(available - free);
	const outside = $derived(Math.max(0, planned - busy));
	const excess = $derived(left - ahead);
</script>

<div class="flex flex-col gap-1.5">
	<p class="flex items-center gap-2">
		<Avatar {name} color={colorIndex} size="sm" />
		<span class="font-medium"
			>{name}{#if suffix}<span class="font-normal text-ink-3"> ({suffix})</span>{/if}</span
		>
	</p>
	<p class="text-sm text-ink-2">
		{#if available || planned}
			<span class="font-medium text-ink">{label(available)} dispo</span> · {label(planned)} prévues ·
			<span class={free ? 'font-medium text-ok-text' : ''}>{label(free)} libres</span>
		{:else}
			Pas de dispo indiquée cette semaine.
		{/if}
	</p>
	{#if available || planned}
		<!-- Planned inside the availability, then what is still free, then work outside of it. -->
		<div
			class="flex h-2 overflow-hidden rounded-full bg-sunken"
			role="img"
			aria-label="{label(busy)} prévues sur {label(available)} dispo"
		>
			<span style="width:{(busy / scale) * 100}%;background:{color}"></span>
			<span
				style="width:{(free / scale) * 100}%;background:color-mix(in oklab,{color} 25%,transparent)"
			></span>
			<span class="bg-warn" style="width:{(outside / scale) * 100}%"></span>
		</div>
	{/if}
	{#if detail}<p class="text-sm text-ink-3">{detail}</p>{/if}
	{#if left}
		<p class="text-sm text-ink-2">
			Reste à faire cette semaine : <span class="font-medium text-ink">{label(left)}</span> · Libre
			:
			<span class="font-medium text-ink">{label(ahead)}</span>
		</p>
		{#if excess > 0}
			<a href={overflowHref} class="text-sm font-medium text-warn-text hover:underline"
				>{label(excess)} de trop : repousse ou délègue</a
			>
		{/if}
	{/if}
</div>
