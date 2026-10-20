import {
	optionalText,
	validTitleOf,
	type Stakeholder,
	type StakeholderRole,
	type Level,
	type TechLevel,
	type InformEvery
} from '../domain/framing';
import { invalid } from '../../kernel/domain/errors';
import { defined, drop, existing, nextPosition, save } from './helpers';
import type { FramingDeps } from './ports';

const validName = validTitleOf('Le nom', 80);

export interface StakeholderFields {
	name: string;
	organization: string;
	role: StakeholderRole;
	influence: Level;
	interest: Level;
	expects: string;
	techLevel: TechLevel | null;
	interactions: string;
	informEvery: InformEvery | null;
	userId: string | null;
	position: number;
}

function cleanTexts(fields: Partial<StakeholderFields>): Partial<StakeholderFields> {
	return {
		...(fields.name !== undefined && { name: validName(fields.name) }),
		...(fields.organization !== undefined && {
			organization: optionalText(fields.organization, 'L’organisation', 80)
		}),
		...(fields.expects !== undefined && {
			expects: optionalText(fields.expects, 'Ce qu’il attend', 1000)
		}),
		...(fields.interactions !== undefined && {
			interactions: optionalText(fields.interactions, 'Les interactions', 1000)
		})
	};
}

async function checkUser(deps: FramingDeps, projectId: string, userId: string | null | undefined) {
	if (userId && !(await deps.access.isMember(projectId, userId)))
		throw invalid('Cette personne ne fait pas partie du projet.');
}

export const createStakeholder =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string } & Partial<StakeholderFields> & { name: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		await checkUser(deps, input.projectId, input.userId);
		const stakeholder: Stakeholder = {
			id: input.id,
			projectId: input.projectId,
			name: '',
			organization: '',
			role: input.role ?? 'uses',
			influence: input.influence ?? 'low',
			interest: input.interest ?? 'high',
			expects: '',
			techLevel: input.techLevel ?? null,
			interactions: '',
			informEvery: input.informEvery ?? null,
			userId: input.userId ?? null,
			position: await nextPosition(deps, 'stakeholders', input.projectId),
			createdAt: deps.clock.now().toISOString(),
			...cleanTexts({ ...input, organization: input.organization ?? '' })
		};
		return save(deps, 'stakeholders', {
			...stakeholder,
			expects: optionalText(input.expects ?? '', 'Ce qu’il attend', 1000),
			interactions: optionalText(input.interactions ?? '', 'Les interactions', 1000)
		});
	};

export const updateStakeholder =
	(deps: FramingDeps) => async (id: string, patch: Partial<StakeholderFields>, actorId: string) => {
		const current = await existing(deps, 'stakeholders', id, actorId);
		if (patch.userId !== undefined) await checkUser(deps, current.projectId, patch.userId);
		return save(deps, 'stakeholders', { ...current, ...defined(patch), ...cleanTexts(patch) });
	};

/** Their stories stay, told by "un utilisateur". */
export const deleteStakeholder = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const stakeholder = await existing(deps, 'stakeholders', id, actorId);
	for (const story of await deps.stores.stories.ofProject(stakeholder.projectId))
		if (story.personaId === id) await save(deps, 'stories', { ...story, personaId: null });
	await drop(deps, 'stakeholders', stakeholder);
};
