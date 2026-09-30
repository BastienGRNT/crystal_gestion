<script lang="ts">
	import Avatar from '../../atoms/Avatar.svelte';
	import type { Person } from '../../types';

	let { members, online }: { members: (Person & { role: string })[]; online: string[] } = $props();
</script>

<ul class="flex flex-col">
	{#each members as member (member.id)}
		<li class="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
			<Avatar name={member.name} color={member.color} size={28} online={online.includes(member.id)} />
			<span class="flex-1 font-medium">{member.name}</span>
			<span class="text-[12px] text-ink-3">{online.includes(member.id) ? 'en ligne' : member.role === 'owner' ? 'créateur' : ''}</span>
		</li>
	{/each}
</ul>
