import type { Activity } from '../domain/activity';

export type NewActivity = Omit<Activity, 'id' | 'createdAt'>;

export interface ActivityRepository {
	insert(activity: NewActivity): Promise<Activity>;
	listRecent(projectId: string, limit: number): Promise<Activity[]>;
}
