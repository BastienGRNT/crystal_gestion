import type { ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { Project } from '../domain/project';

export interface ProjectRepository {
	list(): Promise<Project[]>;
	get(id: string): Promise<Project | null>;
	insert(project: Project): Promise<void>;
	save(project: Project): Promise<void>;
}

/** Lets other modules react to a new project (its discussion channel is created this way). */
export interface ProjectHooks {
	created(project: Project, actorId: string): Promise<void>;
}

export interface ProjectDeps {
	projects: ProjectRepository;
	clock: Clock;
	feed: ChangeFeed<Project>;
	activity: ActivityLog;
	hooks: ProjectHooks;
}
