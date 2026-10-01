<script lang="ts">
	import { Bell, LogOut, Monitor, Moon, Sun } from '@lucide/svelte';
	import Avatar from '../atoms/Avatar.svelte';
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
	const icon =
		'relative flex size-[30px] items-center justify-center rounded-lg text-ink-2 transition hover:bg-side-hover hover:text-ink';
</script>

<div class="flex items-center gap-2 pt-1.5 pr-1 pb-0.5 pl-1.5">
	<Popover open={menuOpen} onclose={() => (menuOpen = false)} side="top">
		{#snippet trigger()}
			<button
				class="flex items-center gap-2 rounded-lg text-sm font-medium"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Mon compte"
			>
				<Avatar name={me.name} color={me.color} size={26} online />{me.name}
			</button>
		{/snippet}
		<form method="POST" action="/logout">
			<MenuItem type="submit" tone="danger"><LogOut size={14} /> Se déconnecter</MenuItem>
		</form>
	</Popover>
	<div class="ml-0.5 flex flex-1 gap-0.5" aria-label="En ligne">
		{#each online.filter((person) => person.id !== me.id) as person (person.id)}
			<span title="{person.name} est en ligne"
				><Avatar name={person.name} color={person.color} size={20} /></span
			>
		{/each}
	</div>
	<button class={icon} title="Notifications" aria-label="Notifications" onclick={onnotifications}>
		<Bell size={16} />
		{#if unread > 0}
			<span class="absolute top-1 right-1 size-2 rounded-full bg-must ring-2 ring-bg"></span>
		{/if}
	</button>
	<button class={icon} title="Changer de thème" aria-label="Changer de thème" onclick={ontheme}>
		<ThemeIcon size={16} />
	</button>
</div>
