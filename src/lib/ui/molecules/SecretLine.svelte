<script lang="ts">
	import { Copy, Eye, EyeOff, LockKeyhole } from '@lucide/svelte';
	import IconButton from '../atoms/IconButton.svelte';
	import InlineText from './InlineText.svelte';

	interface Props {
		value: string;
		onsave: (value: string) => void;
		oncopy: () => void;
	}

	let { value, onsave, oncopy }: Props = $props();
	let revealed = $state(false);
</script>

<div class="flex min-h-8 items-center gap-2.5" title="Mot de passe">
	<LockKeyhole size={14} class="shrink-0 text-ink-3" />
	<div class="min-w-0 flex-1 truncate">
		{#if revealed || !value}
			<InlineText
				{value}
				{onsave}
				placeholder="Mot de passe"
				required={false}
				class="truncate py-0.5 font-mono text-[12.5px]"
			/>
		{:else}
			<span
				class="text-[16px] leading-none tracking-[0.06em] text-ink-2 select-none"
				aria-label="Masqué">••••••••</span
			>
		{/if}
	</div>
	{#if value}
		<IconButton
			size="sm"
			label={revealed ? 'Masquer' : 'Afficher'}
			onclick={() => (revealed = !revealed)}
		>
			{#if revealed}<EyeOff size={13} />{:else}<Eye size={13} />{/if}
		</IconButton>
		<IconButton size="sm" label="Copier le mot de passe" onclick={oncopy}
			><Copy size={13} /></IconButton
		>
	{/if}
</div>
