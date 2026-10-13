<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Snippet } from 'svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		title: string;
		intro?: string;
		submit: string;
		action?: string;
		message?: string;
		children: Snippet;
	}

	let { title, intro, submit, action, message, children }: Props = $props();
	let busy = $state(false);
</script>

<h1 class="text-xl font-semibold tracking-tight">{title}</h1>
{#if intro}<p class="mt-1 text-base text-ink-3">{intro}</p>{/if}

<form
	method="POST"
	{action}
	class="mt-6 flex flex-col gap-4"
	use:enhance={() => {
		busy = true;
		return async ({ update }) => {
			await update({ reset: false });
			busy = false;
		};
	}}
>
	{@render children()}
	{#if message}
		<p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-text" role="alert">
			{message}
		</p>
	{/if}
	<Button type="submit" variant="primary" size="lg" loading={busy} class="mt-1 w-full"
		>{submit}</Button
	>
</form>
