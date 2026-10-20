import { describe, expect, it } from 'vitest';
import { FakeAccess, FixedClock, testId } from '../../kernel/testing';
import type { Project } from '../../projects/domain/project';
import { createAssistant } from '../index';
import type { LlmRequest, MonthUsage, UsageRecord } from './ports';

const P = '10000000-0000-4000-8000-000000000001';
const project = { id: P, name: 'RDV', brief: '', techSpec: '', kind: 'product' } as Project;

function setup(
	options: { configured?: boolean; quota?: { requests: number; micros: number } } = {}
) {
	const records: UsageRecord[] = [];
	const calls: LlmRequest[] = [];
	const assistant = createAssistant({
		llm: {
			configured: () => options.configured ?? true,
			billing: { provider: 'anthropic', free: false },
			async propose(request) {
				calls.push(request);
				return {
					model: 'claude-haiku-5-5',
					usage: { input: 1000, output: 500, cacheWrite: 0, cacheRead: 0 },
					raw: {
						summary: 'Deux tâches',
						verdict: 'none',
						questions: [{ text: 'Mobile ?', options: ['Oui', 'Non'], suggested: 'Oui' }],
						ops: [
							{
								command: 'tasks.create',
								ref: '',
								input: '{"title":"Écrire la page"}',
								reason: '',
								sources: []
							},
							{ command: 'tasks.delete', ref: '', input: '{}', reason: '', sources: [] }
						]
					}
				};
			}
		},
		usage: {
			async insert(r) {
				records.push(r);
			},
			async since(): Promise<MonthUsage[]> {
				const own = records.filter((r) => r.projectId === P);
				return own.length
					? [
							{
								projectId: P,
								requests: own.length,
								micros: own.reduce((s, r) => s + r.costMicros, 0)
							}
						]
					: [];
			},
			async cached(fingerprint) {
				return records.find((r) => r.fingerprint === fingerprint)?.proposal ?? null;
			}
		},
		reader: {
			async read() {
				return {
					project,
					today: '2026-10-20',
					members: [],
					milestones: [],
					tasks: [],
					decisions: [],
					hypotheses: [],
					metrics: [],
					components: [],
					initiatives: [],
					epics: [],
					stories: [],
					stakeholders: [],
					swot: [],
					strategies: [],
					terms: [],
					journeys: []
				};
			}
		},
		access: new FakeAccess({ [P]: ['ana'] }),
		clock: new FixedClock(),
		quota: options.quota ?? { requests: 10, micros: 1_000_000 },
		newId: testId
	});
	const input = {
		projectId: P,
		action: 'refineIdeas' as const,
		targetId: null,
		answers: [],
		previous: null,
		remark: null
	};
	return { assistant, records, calls, input };
}

describe('asking the assistant', () => {
	it('is for the project’s members only', async () => {
		const { assistant, input, calls } = setup();
		await expect(assistant.ask(input, 'zoe')).rejects.toThrow('Tu ne fais pas partie');
		expect(calls).toHaveLength(0);
	});

	it('says so when the server has no key', async () => {
		const { assistant, input } = setup({ configured: false });
		await expect(assistant.ask(input, 'ana')).rejects.toThrow('pas configuré');
	});

	it('keeps the allowed ops, records the cost and serves the same ask from the cache', async () => {
		const { assistant, input, records, calls } = setup();
		const first = await assistant.ask(input, 'ana');
		expect(first.proposal.ops).toEqual([]);
		expect(first.proposal.dropped).toBe(2);
		expect(first.costMicros).toBe(350);
		expect(records).toHaveLength(1);
		const again = await assistant.ask(input, 'ana');
		expect(again.cached).toBe(true);
		expect(calls).toHaveLength(1);
	});

	it('asks no more questions once the team answered', async () => {
		const { assistant, input } = setup();
		const result = await assistant
			.ask({ ...input, action: 'splitStep', targetId: null, answers: [] }, 'ana')
			.catch((e: Error) => e);
		expect(result).toBeInstanceOf(Error);
		const answered = await assistant.ask(
			{ ...input, answers: [{ question: 'Mobile ?', answer: 'Oui' }] },
			'ana'
		);
		expect(answered.proposal.questions).toEqual([]);
	});

	it('stops at the month’s quota', async () => {
		const { assistant, input } = setup({ quota: { requests: 1, micros: 1_000_000 } });
		await assistant.ask(input, 'ana');
		await expect(
			assistant.ask({ ...input, answers: [{ question: 'x', answer: 'y' }] }, 'ana')
		).rejects.toThrow('budget du mois');
	});
});
