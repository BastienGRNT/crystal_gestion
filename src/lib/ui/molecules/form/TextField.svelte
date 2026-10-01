<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		/** The main field of a form: bigger, focused on open. */
		main?: boolean;
		rows?: number;
		type?: 'text' | 'url' | 'email' | 'tel' | 'password';
		mono?: boolean;
		onenter?: () => void;
	}

	let {
		value = $bindable(),
		placeholder = '',
		main = false,
		rows = 0,
		type = 'text',
		mono = false,
		onenter
	}: Props = $props();
	const field =
		'w-full rounded-[12px] border-[1.5px] border-line-strong bg-surface px-4 outline-none transition placeholder:text-ink-3 focus:border-ink focus:shadow-[0_0_0_4px_var(--accent-soft)]';
</script>

{#if rows}
	<textarea
		bind:value
		{rows}
		{placeholder}
		class="{field} resize-none py-3 text-[15px] leading-relaxed"></textarea>
{:else}
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value
		{type}
		{placeholder}
		autofocus={main}
		autocomplete="off"
		onkeydown={(e) => e.key === 'Enter' && onenter && (e.preventDefault(), onenter())}
		class="{field} {main ? 'h-[52px] text-[17px] font-semibold' : 'h-11 text-[15px]'} {mono
			? 'font-mono'
			: ''}"
	/>
{/if}
