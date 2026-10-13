<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { Icon } from '../types';

	interface Props extends HTMLAnchorAttributes {
		icon: Icon;
		label: string;
	}

	let { icon: IconComponent, label, class: extra = '', ...rest }: Props = $props();
</script>

<a
	aria-label={label}
	title={label}
	class={[
		'inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-3 transition-colors hover:bg-hover hover:text-ink',
		extra
	]}
	{...rest}
>
	<IconComponent size={17} strokeWidth={2} aria-hidden="true" />
</a>
