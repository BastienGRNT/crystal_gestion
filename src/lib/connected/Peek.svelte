<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import { KIND_META } from '$lib/client/refs/kinds';
	import Drawer from '$lib/ui/organisms/Drawer.svelte';
	import GenericDetail from './peek/GenericDetail.svelte';
	import { PEEK_DETAILS } from './peek/registry';

	const { refs } = useProject();
	const element = $derived.by(() => {
		const ref = page.url.searchParams.get('peek');
		return ref ? refs.find(ref) : undefined;
	});
	const Detail = $derived(element ? (PEEK_DETAILS[element.kind] ?? GenericDetail) : GenericDetail);

	function close() {
		const url = new URL(page.url);
		url.searchParams.delete('peek');
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

{#if element}
	{@const Icon = KIND_META[element.kind].icon}
	<Drawer onclose={close}>
		{#snippet header()}
			<p class="flex items-center gap-2 text-sm text-ink-3">
				<Icon size={14} />{KIND_META[element.kind].label}
				<span class="font-mono">{element.ref}</span>
			</p>
		{/snippet}
		{#key element.id}<Detail {element} onclose={close} />{/key}
	</Drawer>
{/if}
