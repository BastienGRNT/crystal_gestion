import { optionalText, validTitleOf, type Journey, type Term } from '../domain/framing';
import { conflict } from '../../kernel/domain/errors';
import { defined, drop, existing, nextPosition, save } from './helpers';
import type { FramingDeps } from './ports';

const validJourneyTitle = validTitleOf('Le parcours');
const validTerm = validTitleOf('Le terme', 60);
const validBody = (text: string) => optionalText(text, 'Le parcours', 20_000);
const validDefinition = (text: string) => optionalText(text, 'La définition', 600);

export const createJourney =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string; title: string; body?: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		return save(deps, 'journeys', {
			id: input.id,
			projectId: input.projectId,
			title: validJourneyTitle(input.title),
			body: validBody(input.body ?? ''),
			position: await nextPosition(deps, 'journeys', input.projectId),
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateJourney =
	(deps: FramingDeps) =>
	async (
		id: string,
		patch: Partial<Pick<Journey, 'title' | 'body' | 'position'>>,
		actorId: string
	) => {
		const current = await existing(deps, 'journeys', id, actorId);
		return save(deps, 'journeys', {
			...current,
			...defined(patch),
			...(patch.title !== undefined && { title: validJourneyTitle(patch.title) }),
			...(patch.body !== undefined && { body: validBody(patch.body) })
		});
	};

export const deleteJourney = (deps: FramingDeps) => async (id: string, actorId: string) =>
	drop(deps, 'journeys', await existing(deps, 'journeys', id, actorId));

async function ensureNewTerm(deps: FramingDeps, projectId: string, term: string, id: string) {
	const taken = (await deps.stores.terms.ofProject(projectId)).some(
		(t) => t.id !== id && t.term.toLowerCase() === term.toLowerCase()
	);
	if (taken) throw conflict('Ce terme est déjà dans le glossaire.');
}

export const createTerm =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string; term: string; definition?: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		const term = validTerm(input.term);
		await ensureNewTerm(deps, input.projectId, term, input.id);
		return save(deps, 'terms', {
			id: input.id,
			projectId: input.projectId,
			term,
			definition: validDefinition(input.definition ?? ''),
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateTerm =
	(deps: FramingDeps) =>
	async (id: string, patch: Partial<Pick<Term, 'term' | 'definition'>>, actorId: string) => {
		const current = await existing(deps, 'terms', id, actorId);
		const term = patch.term !== undefined ? validTerm(patch.term) : current.term;
		await ensureNewTerm(deps, current.projectId, term, id);
		return save(deps, 'terms', {
			...current,
			term,
			...(patch.definition !== undefined && { definition: validDefinition(patch.definition) })
		});
	};

export const deleteTerm = (deps: FramingDeps) => async (id: string, actorId: string) =>
	drop(deps, 'terms', await existing(deps, 'terms', id, actorId));
