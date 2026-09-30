<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { domainOf } from '$lib/modules/resources/domain/link';
	import type { Account } from '$lib/modules/resources/domain/resources';
	import AccountFields from './AccountFields.svelte';
	import CardHeader from './CardHeader.svelte';
	import FeatureChip from './FeatureChip.svelte';

	let { account }: { account: Account } = $props();
	const { actions } = useProject();
</script>

<article
	class="group flex animate-rise flex-col rounded-lg border border-line bg-surface p-4 transition hover:border-line-strong"
>
	<CardHeader
		title={account.title}
		ref={account.ref}
		subtitle={account.url ? domainOf(account.url) : undefined}
		onrename={(title) => actions.resources.updateAccount(account.id, { title })}
		onremove={() => actions.resources.removeAccount(account.id)}
	/>
	<div class="mt-3 flex-1 border-t border-line pt-2"><AccountFields {account} /></div>
	<footer class="mt-2">
		<FeatureChip
			value={account.featureId}
			onchange={(featureId) => actions.resources.updateAccount(account.id, { featureId })}
		/>
	</footer>
</article>
