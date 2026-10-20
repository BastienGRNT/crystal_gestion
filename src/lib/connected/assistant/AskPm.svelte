<script lang="ts">
	import { Sparkles } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { describeOp } from '$lib/client/views/proposal';
	import { ACTIONS, type ActionKey } from '$lib/modules/assistant/domain/actions';
	import { costLabel, estimateMicros } from '$lib/modules/assistant/domain/pricing';
	import type { Proposal } from '$lib/modules/assistant/domain/proposal';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import ProposalPanel from '$lib/ui/organisms/ProposalPanel.svelte';
	import { nameOf, projectStamp } from './stamp';
	import { lastProposals } from './last.svelte';

	interface Props {
		projectId: string;
		action: ActionKey;
		targetId?: string | null;
		size?: 'sm' | 'md';
		variant?: 'secondary' | 'ghost';
	}

	let { projectId, action, targetId = null, size = 'sm', variant = 'secondary' }: Props = $props();
	const { app, actions } = useApp();

	const spec = $derived(ACTIONS[action]);
	const key = $derived(`${projectId}:${action}:${targetId ?? ''}`);
	const stamp = $derived(projectStamp(app, projectId));
	const last = $derived(lastProposals.get(key));
	const unchanged = $derived(last?.stamp === stamp);
	const estimate = $derived(
		costLabel(estimateMicros(spec.size, spec.contextBudget, spec.maxTokens))
	);

	let open = $state(false);
	let phase = $state<'loading' | 'questions' | 'proposal'>('loading');
	let proposal = $state<Proposal | null>(null);
	let answers = $state<{ question: string; answer: string }[]>([]);
	let revised = $state(false);
	let costNote = $state('');

	async function run(extra: { answers?: typeof answers; remark?: string } = {}) {
		phase = 'loading';
		const result = await actions.assistant.ask({
			projectId,
			action,
			targetId,
			answers: extra.answers ?? answers,
			previous: extra.remark ? proposal : null,
			remark: extra.remark ?? null
		});
		if (!result) return void (open = false);
		proposal = result.proposal;
		costNote = result.cached
			? 'Rien n’a changé depuis : même réponse, gratuite.'
			: `Coût : ${costLabel(result.costMicros)}.`;
		phase = proposal.questions.length ? 'questions' : 'proposal';
		lastProposals.set(key, { stamp, proposal, costNote });
	}

	/** A click, and only a click, asks. Nothing moved since the last answer: show it again. */
	function start() {
		open = true;
		revised = false;
		answers = [];
		if (unchanged && last) {
			proposal = last.proposal;
			costNote = last.costNote;
			phase = proposal.questions.length ? 'questions' : 'proposal';
			return;
		}
		void run();
	}

	const changes = $derived(
		(proposal?.ops ?? []).map((op) => {
			const view = describeOp(op, (id) => nameOf(app, id));
			return {
				id: op.id,
				label: view.label,
				text: view.field ? view.text : null,
				details: view.details,
				reason: op.reason,
				sources: op.sources
			};
		})
	);

	function accept(ids: string[], texts: Record<string, string>) {
		if (!proposal) return;
		const chosen = proposal.ops
			.filter((op) => ids.includes(op.id))
			.map((op) => {
				const view = describeOp(op, () => null);
				return view.field && texts[op.id] !== undefined
					? { ...op, input: { ...op.input, [view.field]: texts[op.id] } }
					: op;
			});
		actions.assistant.apply(projectId, chosen);
		open = false;
		lastProposals.delete(key);
	}
</script>

{#if app.assistant.enabled}
	<Button
		{size}
		{variant}
		icon={Sparkles}
		title={unchanged
			? 'Rien n’a changé depuis : la dernière proposition s’affiche, sans frais.'
			: `Estimation : ${estimate}`}
		onclick={start}
		>{unchanged
			? 'Revoir la proposition'
			: spec.label.charAt(0).toUpperCase() + spec.label.slice(1)}</Button
	>

	<Dialog
		bind:open
		size="lg"
		title="Chef de projet IA : {spec.label}"
		description="Il propose, tu décides : rien n’est appliqué sans ton accord."
	>
		<ProposalPanel
			{phase}
			summary={proposal?.summary ?? ''}
			verdict={proposal?.verdict ?? 'none'}
			questions={proposal?.questions ?? []}
			{changes}
			dropped={proposal?.dropped ?? 0}
			canRevise={!revised}
			{costNote}
			onanswer={(a) => {
				answers = a;
				void run({ answers: a });
			}}
			onrevise={(remark) => {
				revised = true;
				void run({ remark });
			}}
			onaccept={accept}
			oncancel={() => (open = false)}
		/>
	</Dialog>
{/if}
