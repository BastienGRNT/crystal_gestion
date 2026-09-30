<script lang="ts">
	import { Bell, LogOut, Monitor, Moon, Sun } from '@lucide/svelte';
	import Avatar from '../atoms/Avatar.svelte';
	import IconButton from '../atoms/IconButton.svelte';
	import MenuItem from '../molecules/MenuItem.svelte';
	import Popover from '../molecules/Popover.svelte';

	type Person = { id: string; name: string; color: string };
	interface Props {
		me: Person;
		online: Person[];
		unread: number;
		themeMode: 'light' | 'dark' | 'system';
		onnotifications: () => void;
		ontheme: () => void;
	}

	let { me, online, unread, themeMode, onnotifications, ontheme }: Props = $props();
	let menuOpen = $state(false);
	const ThemeIcon = $derived(themeMode === 'light' ? Sun : themeMode === 'dark' ? Moon : Monitor);
	const themeLabel = $derived(
		themeMode === 'light' ? 'Clair' : themeMode === 'dark' ? 'Sombre' : 'Système'
	);
</script>

<div class="flex items-center gap-1 border-t border-line px-3 py-2.5">
	<Popover open={menuOpen} onclose={() => (menuOpen = false)} side="top">
		{#snippet trigger()}
			<button class="rounded-full" onclick={() => (menuOpen = !menuOpen)} aria-label="Mon compte">
				<Avatar name={me.name} color={me.color} size={26} online />
			</button>
		{/snippet}
		<p class="px-2.5 py-1.5 text-[13px] font-medium">{me.name}</p>
		<MenuItem onclick={ontheme}><ThemeIcon size={14} /> Thème : {themeLabel}</MenuItem>
		<form method="POST" action="/logout">
			<MenuItem type="submit" tone="danger"><LogOut size={14} /> Se déconnecter</MenuItem>
		</form>
	</Popover>
	<div class="ml-1 flex flex-1 -space-x-1.5" aria-label="En ligne">
		{#each online.filter((person) => person.id !== me.id) as person (person.id)}
			<Avatar name={person.name} color={person.color} size={22} online />
		{/each}
	</div>
	<IconButton label="Notifications" onclick={onnotifications} class="relative">
		<Bell size={16} />
		{#if unread > 0}
			<span
				class="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-must font-mono text-[9px] text-white"
				>{Math.min(unread, 9)}</span
			>
		{/if}
	</IconButton>
</div>
