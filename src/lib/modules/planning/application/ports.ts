import type { Availability } from '../domain/availability';

export type AvailabilityChanges = Partial<Pick<Availability, 'startsAt' | 'endsAt' | 'status'>>;

export interface AvailabilityRepository {
	create(input: Omit<Availability, 'id'>): Promise<Availability>;
	update(id: string, changes: AvailabilityChanges): Promise<Availability>;
	delete(id: string): Promise<void>;
	findOwned(id: string, userId: string): Promise<Availability | null>;
	listForProject(projectId: string): Promise<Availability[]>;
}

export interface UserProjects {
	projectIdsOf(userId: string): Promise<string[]>;
}
