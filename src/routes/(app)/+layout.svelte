<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { createActions } from '$lib/client/actions';
	import { provideApp } from '$lib/client/context';
	import { desktopAlerts } from '$lib/client/desktop-alerts.svelte';
	import { Overlays } from '$lib/client/overlays.svelte';
	import { Realtime } from '$lib/client/realtime.svelte';
	import { AppState } from '$lib/client/state/app.svelte';
	import { followSystemTheme } from '$lib/client/theme';
	import { flushPendingDeletions, toasts } from '$lib/client/toasts.svelte';
	import { alertFor } from '$lib/client/views/alerts';
	import Overlay from '$lib/connected/overlays/Overlays.svelte';
	import Shell from '$lib/connected/shell/Shell.svelte';
	import Shortcuts from '$lib/connected/shell/Shortcuts.svelte';
	import Toaster from '$lib/ui/organisms/Toaster.svelte';

	let { data, children } = $props();

	const app = new AppState(untrack(() => data.snapshot));
	const actions = createActions(app);
	const overlays = new Overlays();
	const realtime = new Realtime(
		(event) => {
			// Judged before applying: once in the store, a new item looks already known.
			const alert = alertFor(event, app, desktopAlerts.effective);
			app.apply(event);
			if (alert) desktopAlerts.show(alert, (href) => goto(href));
		},
		() => invalidateAll()
	);
	app.onMessageWhileViewing = (channelId) => actions.chat.markRead(channelId);
	app.onTeamChange = () => void invalidateAll();
	provideApp({ app, actions, realtime, overlays });

	// A fresh snapshot (after a reconnection) replaces the data in place.
	let current = untrack(() => data.snapshot);
	$effect(() => {
		if (data.snapshot === current) return;
		current = data.snapshot;
		app.reset(data.snapshot);
	});

	onMount(() => {
		realtime.start();
		const stopTheme = followSystemTheme();
		return () => {
			realtime.close();
			stopTheme();
		};
	});
</script>

<svelte:window onpagehide={flushPendingDeletions} />

<Shell>{@render children()}</Shell>
<Overlay />
<Shortcuts />
<Toaster toasts={toasts.items} ondismiss={(id) => toasts.dismiss(id)} />
