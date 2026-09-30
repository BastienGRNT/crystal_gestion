import type { Framing, Member, MemberRole, Project } from '../domain/project';
import type { Invitation } from '../domain/invitation';
import type { VisitState } from '../domain/visit';

export interface ProjectRepository {
	create(framing: Framing & { slug: string; createdBy: string }): Promise<Project>;
	update(id: string, changes: Partial<Framing>): Promise<Project>;
	findById(id: string): Promise<Project | null>;
	findBySlug(slug: string): Promise<Project | null>;
	slugExists(slug: string): Promise<boolean>;
	listForUser(userId: string): Promise<Project[]>;
}

export interface MemberRepository {
	add(projectId: string, userId: string, role: MemberRole): Promise<Member>;
	list(projectId: string): Promise<Member[]>;
	isMember(projectId: string, userId: string): Promise<boolean>;
	visitState(projectId: string, userId: string): Promise<VisitState>;
	saveVisitState(projectId: string, userId: string, state: VisitState): Promise<void>;
}

export interface InvitationRepository {
	create(input: {
		projectId: string;
		tokenHash: string;
		invitedBy: string;
		expiresAt: Date;
	}): Promise<void>;
	findByTokenHash(tokenHash: string): Promise<Invitation | null>;
	markAccepted(id: string, userId: string, at: Date): Promise<void>;
}
