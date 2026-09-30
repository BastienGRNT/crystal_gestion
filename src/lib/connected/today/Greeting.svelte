<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';

	const { store, me } = useProject();
	const hour = new Date().getHours();
	const hello = hour < 5 ? 'Bonne nuit' : hour < 18 ? 'Bonjour' : 'Bonsoir';
	const others = $derived(
		store.members.items
			.filter((m) => m.id !== me.id && store.online.includes(m.id))
			.map((m) => m.name)
	);
	const summary = $derived(
		others.length
			? `${others.join(' et ')} ${others.length > 1 ? 'sont' : 'est'} en ligne en ce moment.`
			: `Voici ta journée sur ${store.project.name}.`
	);
</script>

<header class="mb-6">
	<p class="mb-3 font-mono text-2xs tracking-[0.14em] text-ink-3 uppercase">
		{formatDay(new Date())}
	</p>
	<h1 class="font-display text-5xl leading-[0.95] sm:text-6xl">
		{hello}, <em class="text-accent-text">{me.name}</em>.
	</h1>
	<p class="mt-3 text-lg text-ink-2">{summary}</p>
</header>
