<script lang="ts">
	interface Props {
		hint: string;
		again: boolean;
		label: string;
		disabled: boolean;
		onagain: () => void;
		onsubmit: () => void;
	}

	let { hint, again, label, disabled, onagain, onsubmit }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line py-3 pr-3 pl-5">
	<p class="min-w-0 flex-1 text-xs text-ink-3">{hint}</p>
	<label class="flex items-center gap-2 text-xs text-ink-2">
		<input type="checkbox" checked={again} onchange={onagain} class="accent-[var(--accent)]" />
		En créer plusieurs
	</label>
	<button
		type="button"
		onclick={onsubmit}
		{disabled}
		class="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition hover:brightness-110 disabled:opacity-40"
	>
		Créer {label}<span class="font-mono text-2xs opacity-75">↵</span>
	</button>
</div>
