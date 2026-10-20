import type { ActionKey } from '$lib/modules/assistant/domain/actions';
import { isRef, type OpCommand, type OpInput } from '$lib/modules/assistant/domain/ops';
import type { Op, Proposal } from '$lib/modules/assistant/domain/proposal';
import type { Criterion } from '$lib/modules/framing/domain/framing';
import {
	briefSections,
	joinBrief,
	joinTech,
	techSections
} from '$lib/modules/projects/domain/project';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { toasts } from '../toasts.svelte';
import type { BaseActions as Actions } from './index';

export interface AskRequest {
	projectId: string;
	action: ActionKey;
	targetId: string | null;
	answers?: { question: string; answer: string }[];
	previous?: Proposal | null;
	remark?: string | null;
}

const checklistOf = (items: string[] | undefined) =>
	items?.map((text) => ({ id: crypto.randomUUID(), text, done: false }));
const criteriaOf = (items: OpInput<'framing.createStory'>['criteria']): Criterion[] | undefined =>
	items?.map((c) => ({
		id: crypto.randomUUID(),
		text: c.text,
		done: false,
		data: c.data ?? '',
		expected: c.expected ?? ''
	}));

/**
 * The AI project manager, from the screens: ask (always after a click), then apply what the
 * person ticked through the usual actions: shown at once, checked by the server, live for all.
 */
export function assistantActions(app: AppState, actions: Actions) {
	async function ask(request: AskRequest) {
		try {
			const result = await send('assistant.ask', {
				projectId: request.projectId,
				action: request.action,
				targetId: request.targetId,
				answers: request.answers ?? [],
				previous: request.previous ?? null,
				remark: request.remark ?? null
			});
			const month = app.assistant.month.filter((m) => m.projectId !== request.projectId);
			app.assistant.month = [...month, { projectId: request.projectId, ...result.month }];
			return result;
		} catch (error) {
			toasts.error(errorMessage(error));
			return null;
		}
	}

	/** Runs one op; returns the id of what it created, for the ops that point at it. */
	function run(
		projectId: string,
		command: OpCommand,
		input: Record<string, unknown>
	): string | null | false {
		const i = input as never;
		switch (command) {
			case 'tasks.create': {
				const { checklist, ...rest } = i as OpInput<'tasks.create'>;
				const task = actions.tasks.create({
					...rest,
					projectId,
					title: rest.title,
					...(checklist && { checklist: checklistOf(checklist) })
				});
				return task?.id ?? false;
			}
			case 'tasks.update': {
				const { id, checklist, ...rest } = i as OpInput<'tasks.update'>;
				if (!app.tasks.get(id)) return false;
				actions.tasks.update(id, {
					...rest,
					...(checklist && { checklist: checklistOf(checklist) })
				});
				return null;
			}
			case 'chat.comment': {
				const { taskId, body } = i as OpInput<'chat.comment'>;
				void actions.chat.comment(taskId, body);
				return null;
			}
			case 'roadmap.createMilestone':
				return (
					actions.roadmap.createStep(projectId, i as OpInput<'roadmap.createMilestone'>)?.id ??
					false
				);
			case 'roadmap.updateMilestone': {
				const { id, reason, ...patch } = i as OpInput<'roadmap.updateMilestone'>;
				actions.roadmap.updateStep(id, patch, reason ?? '');
				return null;
			}
			case 'roadmap.createDecision':
				return (
					actions.roadmap.decide({
						...(i as OpInput<'roadmap.createDecision'>),
						projectId,
						source: 'ai'
					})?.id ?? false
				);
			case 'roadmap.createHypothesis':
				void actions.roadmap.addHypothesis(
					projectId,
					(i as OpInput<'roadmap.createHypothesis'>).text
				);
				return null;
			case 'roadmap.createMetric': {
				const { name, ...fields } = i as OpInput<'roadmap.createMetric'>;
				return actions.roadmap.addMetric(projectId, name, fields)?.id ?? false;
			}
			case 'project.brief': {
				const project = app.projects.get(projectId);
				const { section, text } = i as OpInput<'project.brief'>;
				if (!project) return false;
				actions.projects.update(projectId, {
					brief: joinBrief({ ...briefSections(project.brief), [section]: text })
				});
				return null;
			}
			case 'project.techSpec': {
				const project = app.projects.get(projectId);
				const { section, text } = i as OpInput<'project.techSpec'>;
				if (!project) return false;
				actions.projects.update(projectId, {
					techSpec: joinTech({ ...techSections(project.techSpec), [section]: text })
				});
				return null;
			}
			case 'components.create': {
				const { name, parentId } = i as OpInput<'components.create'>;
				return actions.tasks.addComponent(projectId, name, parentId ?? null)?.id ?? false;
			}
			case 'framing.createStakeholder': {
				const { name, role, ...rest } = i as OpInput<'framing.createStakeholder'>;
				const created = actions.framing.addStakeholder(projectId, name, role ?? 'uses');
				if (created && Object.keys(rest).length)
					actions.framing.updateStakeholder(created.id, rest);
				return created?.id ?? false;
			}
			case 'framing.createInitiative': {
				const { title, why } = i as OpInput<'framing.createInitiative'>;
				const created = actions.framing.addInitiative(projectId, title);
				if (created && why) actions.framing.updateInitiative(created.id, { why });
				return created?.id ?? false;
			}
			case 'framing.createEpic': {
				const { title, ...fields } = i as OpInput<'framing.createEpic'>;
				return actions.framing.addEpic(projectId, title, fields)?.id ?? false;
			}
			case 'framing.createStory': {
				const { want, criteria, ...fields } = i as OpInput<'framing.createStory'>;
				return (
					actions.framing.addStory(projectId, want, {
						...fields,
						criteria: criteriaOf(criteria) ?? []
					})?.id ?? false
				);
			}
			case 'framing.updateStory': {
				const { id, criteria, ...fields } = i as OpInput<'framing.updateStory'>;
				actions.framing.updateStory(id, {
					...fields,
					...(criteria && { criteria: criteriaOf(criteria) })
				});
				return null;
			}
			case 'framing.createSwotItem': {
				const { quadrant, text } = i as OpInput<'framing.createSwotItem'>;
				return actions.framing.addSwotItem(projectId, quadrant, text)?.id ?? false;
			}
			case 'framing.createStrategy': {
				const { kind, text, itemIds } = i as OpInput<'framing.createStrategy'>;
				return actions.framing.addStrategy(projectId, kind, text, itemIds ?? [])?.id ?? false;
			}
			case 'framing.createTerm': {
				const { term, definition } = i as OpInput<'framing.createTerm'>;
				return actions.framing.addTerm(projectId, term, definition)?.id ?? false;
			}
			case 'framing.createJourney': {
				const { title, body } = i as OpInput<'framing.createJourney'>;
				const created = actions.framing.addJourney(projectId, title);
				if (created && body) actions.framing.updateJourney(created.id, { body });
				return created?.id ?? false;
			}
		}
	}

	/**
	 * Applies the ticked ops in order. An op pointing at an item another op creates (`$e1`)
	 * gets that item's id; if that op was left out, the one pointing at it is skipped too.
	 */
	function apply(projectId: string, ops: Op[]) {
		const created = new Map<string, string>();
		let applied = 0;
		let skipped = 0;
		for (const op of ops) {
			let missing = false;
			const swap = (v: unknown) => {
				if (!isRef(v)) return v;
				const id = created.get(v.slice(1));
				if (!id) missing = true;
				return id;
			};
			const input = Object.fromEntries(
				Object.entries(op.input).map(([k, v]) => [k, Array.isArray(v) ? v.map(swap) : swap(v)])
			);
			if (missing) {
				skipped++;
				continue;
			}
			const result = run(projectId, op.command, input);
			if (result === false) {
				skipped++;
				continue;
			}
			if (result && op.ref) created.set(op.ref, result);
			applied++;
		}
		toasts.show(
			skipped
				? `${applied} changement${applied > 1 ? 's' : ''} appliqué${applied > 1 ? 's' : ''}, ${skipped} laissé${skipped > 1 ? 's' : ''} de côté`
				: `${applied} changement${applied > 1 ? 's' : ''} appliqué${applied > 1 ? 's' : ''}`,
			{ tone: 'success' }
		);
		return applied;
	}

	return { ask, apply };
}
