<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { afterNavigate, goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { createActions } from '$lib/client/actions';
	import { flushPendingDeletes } from '$lib/client/live/undoable';
	import { setProjectContext } from '$lib/client/context';
	import { ProjectStore } from '$lib/client/project-store.svelte';
	import { RealtimeClient } from '$lib/client/realtime/socket.svelte';
	import { RefTools } from '$lib/client/refs/ref-tools.svelte';
	import { overlays } from '$lib/client/overlays.svelte';
	import { theme } from '$lib/client/theme.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { NOTIFICATION_VERBS } from '$lib/modules/notifications/domain/notification';
	import AppFrame from '$lib/connected/AppFrame.svelte';

	let { data, children } = $props();

	const initial = untrack(() => ({ snapshot: data.snapshot, me: data.me }));
	const store = new ProjectStore(initial.snapshot, (notification) => {
		const actor = store.members.get(notification.actorId)?.name ?? 'Quelqu’un';
		toasts.show(`${actor} ${NOTIFICATION_VERBS[notification.type]} ${notification.elementRef}`);
	});
	const realtime = new RealtimeClient(() => invalidateAll());
	const refs = new RefTools(store, () => page.url.pathname);
	const peek = (ref: string) => {
		const url = new URL(page.url);
		url.searchParams.set('peek', ref);
		goto(url, { noScroll: true, keepFocus: true });
	};
	setProjectContext({
		store,
		realtime,
		refs,
		me: initial.me,
		actions: createActions(store, initial.me.id),
		peek
	});

	$effect.pre(() => store.reset(data.snapshot));
	afterNavigate(() => (overlays.mobileMenu = false));
	$effect(() => realtime.join(data.snapshot.project.id));
	onMount(() => {
		theme.init();
		const unsubscribe = realtime.subscribe((event) => store.apply(event));
		return () => (unsubscribe(), realtime.close());
	});
</script>

<svelte:window onpagehide={flushPendingDeletes} />

<svelte:head><title>{store.project.name} · Crystal</title></svelte:head>

<AppFrame projects={data.projects}>{@render children()}</AppFrame>
