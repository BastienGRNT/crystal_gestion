import type { ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { Invitation, Member } from '../domain/membership';
import type { Project } from '../domain/project';

export interface ProjectRepository {
	listByIds(ids: string[]): Promise<Project[]>;
	get(id: string): Promise<Project | null>;
	/** Every slug in use, whoever's project it is: URLs are unique app-wide. */
	slugs(): Promise<string[]>;
	insert(project: Project): Promise<void>;
	save(project: Project): Promise<void>;
}

export interface MemberRepository {
	ofProjects(projectIds: string[]): Promise<Member[]>;
	projectIdsOf(userId: string): Promise<string[]>;
	find(projectId: string, userId: string): Promise<Member | null>;
	add(member: Member): Promise<void>;
	remove(projectId: string, userId: string): Promise<void>;
}

export interface InvitationRepository {
	create(tokenHash: string, invitation: Invitation): Promise<void>;
	find(tokenHash: string): Promise<Invitation | null>;
	markUsed(tokenHash: string, userId: string, at: Date): Promise<void>;
}

/** Lets other modules react to a new project (its discussion channel is created this way). */
export interface ProjectHooks {
	created(project: Project, actorId: string): Promise<void>;
}

export interface InviteTokens {
	generate(): string;
	hash(token: string): string;
}

export interface ProjectDeps {
	projects: ProjectRepository;
	members: MemberRepository;
	invitations: InvitationRepository;
	tokens: InviteTokens;
	nameOf(userId: string): Promise<string>;
	clock: Clock;
	feed: ChangeFeed<Project>;
	memberFeed: ChangeFeed<Member>;
	activity: ActivityLog;
	hooks: ProjectHooks;
}
