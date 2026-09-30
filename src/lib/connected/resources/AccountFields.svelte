<script lang="ts">
	import { Copy, ExternalLink, Globe, UserRound } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { Account, AccountFields } from '$lib/modules/resources/domain/resources';
	import { safeUrl } from '$lib/modules/resources/domain/link';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import FieldLine from '$lib/ui/molecules/FieldLine.svelte';
	import SecretLine from '$lib/ui/molecules/SecretLine.svelte';
	import { copy } from './clipboard';
	import NotesField from './NotesField.svelte';

	let { account }: { account: Account } = $props();
	const { actions } = useProject();
	const save = (changes: Partial<AccountFields>) =>
		actions.resources.updateAccount(account.id, changes);
</script>

<div class="flex flex-col">
	<FieldLine
		icon={UserRound}
		label="Identifiant"
		value={account.login}
		placeholder="Identifiant"
		mono
		onsave={(login) => save({ login })}
	>
		{#snippet trailing()}
			<IconButton
				size="sm"
				label="Copier l’identifiant"
				onclick={() => copy(account.login, 'Identifiant')}><Copy size={13} /></IconButton
			>
		{/snippet}
	</FieldLine>
	<SecretLine
		value={account.secret}
		onsave={(secret) => save({ secret })}
		oncopy={() => copy(account.secret, 'Mot de passe')}
	/>
	<FieldLine
		icon={Globe}
		label="URL"
		value={account.url}
		placeholder="URL de connexion"
		onsave={(url) => save({ url })}
	>
		{#snippet trailing()}
			<IconLink href={safeUrl(account.url)} label="Ouvrir" external
				><ExternalLink size={13} /></IconLink
			>
		{/snippet}
	</FieldLine>
	<NotesField value={account.notes} onsave={(notes) => save({ notes })} />
</div>
