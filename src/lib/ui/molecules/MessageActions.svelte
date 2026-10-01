<script lang="ts">
	import {
		BookOpen,
		CircleHelp,
		CircleOff,
		Ellipsis,
		Lightbulb,
		Pencil,
		Reply,
		Shuffle,
		SquareCheckBig,
		Trash2,
		Wrench
	} from '@lucide/svelte';
	import type { MenuAction, MessageHandlers, MessageView } from '../discussion';
	import IconButton from '../atoms/IconButton.svelte';
	import IconMenu from './IconMenu.svelte';

	let { view, ...on }: { view: MessageView } & MessageHandlers = $props();

	const convert: MenuAction[] = [
		{ label: 'Une Task', icon: SquareCheckBig, run: () => on.onconvert('task') },
		{ label: 'Un Fix', icon: Wrench, run: () => on.onconvert('fix') },
		{ label: 'Une idée', icon: Lightbulb, run: () => on.onconvert('idea') }
	];
	const own = $derived<MenuAction[]>([
		{ label: 'Modifier', icon: Pencil, run: on.onedit },
		...(view.hasMentions
			? [
					view.isQuestion
						? { label: 'Retirer la question', icon: CircleOff, run: () => on.onquestion(false) }
						: { label: 'Marquer comme question', icon: CircleHelp, run: () => on.onquestion(true) }
				]
			: []),
		{ label: 'Supprimer', icon: Trash2, tone: 'danger', run: on.ondelete }
	]);
</script>

<!-- Floating on hover with a mouse; always shown on touch and small screens. -->
<div
	class="z-10 flex items-center gap-0.5 rounded-lg p-0.5 transition-opacity md:absolute md:-top-3 md:right-5 md:border md:border-line md:bg-surface md:opacity-0 md:shadow-pop md:group-hover:opacity-100 md:focus-within:opacity-100 md:has-[[data-open]]:opacity-100 md:pointer-coarse:opacity-100 {view.compact
		? 'justify-end'
		: 'absolute top-1 right-2'}"
>
	<IconButton label="Répondre" size="sm" onclick={on.onreply}><Reply size={14} /></IconButton>
	<IconButton label="Garder comme décision" size="sm" onclick={() => on.onconvert('decision')}
		><BookOpen size={14} /></IconButton
	>
	<IconMenu label="En faire…" icon={Shuffle} heading="En faire" items={convert} />
	{#if view.mine}<IconMenu label="Plus d’actions" icon={Ellipsis} items={own} />{/if}
</div>
