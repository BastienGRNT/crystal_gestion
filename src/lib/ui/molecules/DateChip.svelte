<script lang="ts">
	import { CalendarDays } from '@lucide/svelte';
	import { addDays, weekdayOf, type DateKey } from '$lib/modules/kernel/domain/dates';
	import Button from '../atoms/Button.svelte';
	import Popover from './Popover.svelte';

	interface Props {
		value: DateKey | null;
		today: DateKey;
		/** How the date reads on the chip ("Pour le ven. 14 nov."). */
		text: string;
		label: string;
		/** Moving a date already set asks why (it becomes a decision). */
		askReason?: boolean;
		tone?: 'neutral' | 'danger' | 'warn';
		onchange: (value: DateKey | null, reason: string) => void;
	}

	let {
		value,
		today,
		text,
		label,
		askReason = false,
		tone = 'neutral',
		onchange
	}: Props = $props();
	let open = $state(false);
	let anchor = $state<HTMLButtonElement>();
	let draft = $state<DateKey | null>(null);
	let reason = $state('');

	const friday = $derived(addDays(today, (4 - weekdayOf(today) + 7) % 7 || 7));
	const quick = $derived([
		{ label: 'Vendredi', date: friday },
		{ label: '+1 semaine', date: addDays(friday, 7) },
		{ label: '+2 semaines', date: addDays(friday, 14) },
		{ label: '+1 mois', date: addDays(friday, 28) }
	]);
	const moving = $derived(askReason && value !== null && draft !== value);

	function toggle() {
		draft = value;
		reason = '';
		open = !open;
	}

	function pick(date: DateKey | null) {
		draft = date;
		// Without a reason to ask, one click is enough.
		if (!(askReason && value !== null && date !== value)) apply();
	}

	function apply() {
		open = false;
		if (draft !== value) onchange(draft, reason.trim());
	}
</script>

<button
	bind:this={anchor}
	type="button"
	aria-label="{label} : {text}"
	aria-expanded={open}
	onclick={toggle}
	class={[
		'inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors',
		tone === 'danger'
			? 'border-danger/40 text-danger-text hover:bg-danger-soft'
			: tone === 'warn'
				? 'border-warn/40 text-warn-text hover:bg-warn-soft'
				: 'border-line text-ink-2 hover:border-line-strong hover:bg-hover'
	]}
>
	<CalendarDays size={15} aria-hidden="true" />{text}
</button>

<Popover bind:open {anchor} {label} class="w-[300px] p-3">
	<div class="flex flex-col gap-3">
		<input
			type="date"
			value={draft ?? ''}
			aria-label={label}
			onchange={(e) => pick(e.currentTarget.value || null)}
			class="h-11 rounded-xl border border-line-strong/70 bg-surface px-3 text-base text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
		/>
		<div class="flex flex-wrap gap-1.5">
			{#each quick as option (option.label)}
				<button
					type="button"
					onclick={() => pick(option.date)}
					class={[
						'h-10 rounded-full border px-3 text-sm transition-colors',
						draft === option.date
							? 'border-accent bg-accent-soft font-medium text-accent-text'
							: 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
					]}>{option.label}</button
				>
			{/each}
			<button
				type="button"
				onclick={() => pick(null)}
				class="h-10 rounded-full border border-line px-3 text-sm text-ink-2 hover:border-line-strong hover:bg-surface-2"
				>Sans date</button
			>
		</div>
		{#if moving}
			<form
				class="flex flex-col gap-2 border-t border-line pt-3"
				onsubmit={(e) => {
					e.preventDefault();
					apply();
				}}
			>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-semibold text-ink-2">Pourquoi ça bouge ? (facultatif)</span>
					<!-- svelte-ignore a11y_autofocus (the question appears right after picking a date) -->
					<input
						bind:value={reason}
						autofocus
						maxlength={500}
						placeholder="Ex. : le client valide les maquettes plus tard"
						class="h-11 rounded-xl border border-line-strong/70 bg-surface px-3 text-base outline-none placeholder:text-ink-3 focus:border-accent focus:ring-4 focus:ring-accent-soft"
					/>
				</label>
				<p class="text-xs text-ink-3">C’est noté dans les décisions, avec la raison.</p>
				<Button type="submit" size="sm" variant="primary" class="self-end">Décaler</Button>
			</form>
		{/if}
	</div>
</Popover>
