import type { TokenService } from '$lib/modules/identity/application/ports';
import type { ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import { makeAcceptInvitation } from './application/accept-invitation';
import { makeCreateProject } from './application/create-project';
import { makeCreateInvitation, makeFindInvitation } from './application/invitations';
import { makeAddMember, makeAssertMember } from './application/membership';
import type {
	InvitationRepository,
	MemberRepository,
	ProjectRepository
} from './application/ports';
import { makeUpdateFraming } from './application/update-framing';
import { makeRecordVisit } from './application/visits';

export interface ProjectsDeps {
	projects: ProjectRepository;
	members: MemberRepository;
	invitations: InvitationRepository;
	tokens: TokenService;
	feed: ChangeFeed;
	clock: Clock;
}

export function createProjectsModule(deps: ProjectsDeps) {
	const findInvitation = makeFindInvitation(deps);
	const addMember = makeAddMember(deps);
	return {
		create: makeCreateProject(deps),
		updateFraming: makeUpdateFraming(deps),
		assertMember: makeAssertMember(deps),
		addMember,
		recordVisit: makeRecordVisit(deps),
		createInvitation: makeCreateInvitation(deps),
		findInvitation,
		acceptInvitation: makeAcceptInvitation({ ...deps, findInvitation, addMember }),
		findBySlug: (slug: string) => deps.projects.findBySlug(slug),
		listForUser: (userId: string) => deps.projects.listForUser(userId),
		listMembers: (projectId: string) => deps.members.list(projectId)
	};
}

export type ProjectsModule = ReturnType<typeof createProjectsModule>;
