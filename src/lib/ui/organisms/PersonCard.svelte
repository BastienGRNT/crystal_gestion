<script lang="ts">
	import {
		CalendarClock,
		CircleCheck,
		CirclePlay,
		MessageCircle,
		SquarePlus
	} from '@lucide/svelte';
	import { rangeLabel } from '$lib/client/format';
	import type { Presence } from '$lib/client/views/presence';
	import type { User } from '$lib/modules/identity/domain/user';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '../atoms/Avatar.svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		user: User;
		presence: Presence;
		recentDone: Task[];
		isMe?: boolean;
		bare?: boolean;
		onopentask: (task: Task) => void;
		onassign?: () => void;
		onmessage?: () => void;
	}

	let {
		user,
		presence,
		recentDone,
		isMe = false,
		bare = false,
		onopentask,
		onassign,
		onmessage
	}: Props = $props();
</script>

{#snippet taskLine(task: Task)}
	<li>
		<button
			class="-mx-1.5 w-[calc(100%+12px)] truncate rounded-md px-1.5 py-0.5 text-left text-base text-ink hover:bg-hover"
			onclick={() => onopentask(task)}>{task.title}</button
		>
	</li>
{/snippet}

<article
	class={[
		'flex flex-col gap-4',
		!bare && 'rounded-2xl border border-line bg-surface p-4 shadow-card'
	]}
>
	<header class="flex items-center gap-3">
		<Avatar name={user.name} color={user.color} size="lg" dot={presence.statusDot} />
		<div class="min-w-0 flex-1">
			<p class="truncate text-md font-semibold">{user.name}{isMe ? ' (toi)' : ''}</p>
			<p class="flex items-center gap-1.5 truncate text-sm text-ink-3">
				<span class={presence.online ? 'font-medium text-ok-text' : ''}>{presence.seen}</span>
				{#if presence.online}<span aria-hidden="true">·</span><span>{presence.status}</span>{/if}
			</p>
		</div>
	</header>

	<dl class="flex flex-col gap-3">
		<div class="flex gap-2.5">
			<dt><CalendarClock size={16} class="mt-0.5 text-ink-3" aria-label="Aujourd’hui" /></dt>
			<dd class="text-base">
				{#if presence.availability}
					<span class="block font-medium">{presence.availability}</span>
					{#if presence.today.length}<span class="block text-sm text-ink-3"
							>Aujourd’hui : {presence.today
								.map((s) => rangeLabel(s.startsAt, s.endsAt))
								.join(' · ')}</span
						>{/if}
				{:else}
					<span class="text-ink-3">Pas de dispo indiquée aujourd’hui</span>
				{/if}
			</dd>
		</div>
		<div class="flex gap-2.5">
			<dt><CirclePlay size={16} class="mt-0.5 text-accent" aria-label="En cours" /></dt>
			<dd class="min-w-0 flex-1">
				{#if presence.working.length}
					<ul class="flex flex-col">
						{#each presence.working as task (task.id)}{@render taskLine(task)}{/each}
					</ul>
				{:else}
					<span class="text-base text-ink-3">Rien en cours</span>
				{/if}
			</dd>
		</div>
		{#if recentDone.length}
			<div class="flex gap-2.5">
				<dt><CircleCheck size={16} class="mt-0.5 text-ok" aria-label="Fait récemment" /></dt>
				<dd class="min-w-0 flex-1">
					<ul class="flex flex-col opacity-80">
						{#each recentDone as task (task.id)}{@render taskLine(task)}{/each}
					</ul>
				</dd>
			</div>
		{/if}
	</dl>

	{#if !isMe && (onassign || onmessage)}
		<footer class="flex flex-wrap gap-2">
			{#if onassign}<Button size="sm" icon={SquarePlus} onclick={onassign}
					>Lui confier une tâche</Button
				>{/if}
			{#if onmessage}<Button size="sm" variant="ghost" icon={MessageCircle} onclick={onmessage}
					>Lui écrire</Button
				>{/if}
		</footer>
	{/if}
</article>
