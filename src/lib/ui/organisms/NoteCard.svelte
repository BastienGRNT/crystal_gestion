<script lang="ts">
	import { Bot, Trash2, User } from '@lucide/svelte';
	import InlineText from '../molecules/InlineText.svelte';

	interface Props {
		content: string;
		source: 'ai' | 'team';
		meta: string;
		onsave: (content: string) => void;
		ondelete: () => void;
	}

	let { content, source, meta, onsave, ondelete }: Props = $props();
</script>

<li class="group flex animate-rise items-start gap-3 border-b border-line py-3 last:border-0">
	<span class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full {source === 'ai' ? 'prism text-white' : 'bg-sunken text-ink-3'}">
		{#if source === 'ai'}<Bot size={13} />{:else}<User size={13} />{/if}
	</span>
	<div class="min-w-0 flex-1">
		<InlineText value={content} {onsave} class="py-0.5 text-[14px] leading-relaxed" />
		<p class="mt-0.5 text-[11.5px] text-ink-3">{meta}</p>
	</div>
	<button onclick={ondelete} class="mt-1 text-ink-3 opacity-0 transition group-hover:opacity-100 hover:text-danger max-sm:opacity-100" aria-label="Supprimer la note"><Trash2 size={14} /></button>
</li>
