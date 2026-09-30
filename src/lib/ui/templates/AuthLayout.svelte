<script lang="ts">
	import type { Snippet } from 'svelte';
	import Logo from '../atoms/Logo.svelte';

	let { title, subtitle, children }: { title: string; subtitle: string; children: Snippet } =
		$props();
</script>

<div class="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
	<aside
		class="relative hidden overflow-hidden bg-night p-12 text-night-ink lg:flex lg:flex-col lg:justify-between"
	>
		<div
			class="absolute -top-40 -right-40 size-[520px] rounded-full opacity-40 blur-[90px] prism"
		></div>
		<div class="relative flex items-center gap-2.5 text-lg font-semibold tracking-tight">
			<Logo size={26} /> Crystal
		</div>
		<p class="relative max-w-md font-display text-5xl leading-[1.02] italic">
			Moins s’organiser.<br />Plus avancer.
		</p>
		<p class="relative max-w-sm text-sm text-night-ink-2">
			Tâches, décisions, discussions et planning au même endroit, pour les side projects qui
			avancent le soir et le week-end.
		</p>
	</aside>
	<main class="flex items-center justify-center p-6">
		<div class="w-full max-w-sm animate-rise">
			<div class="mb-8 flex items-center gap-2 lg:hidden">
				<Logo size={24} /><span class="font-semibold">Crystal</span>
			</div>
			<h1 class="font-display text-4xl leading-none">{title}</h1>
			<p class="mt-2 mb-8 text-ink-2">{subtitle}</p>
			{@render children()}
		</div>
	</main>
</div>
