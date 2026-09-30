import type { AiNote } from '../domain/ai-note';
import type { ProjectContext } from '../domain/project-context';

export interface AiNoteRepository {
	create(note: Omit<AiNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<AiNote>;
	update(projectId: string, id: string, content: string): Promise<AiNote | null>;
	delete(projectId: string, id: string): Promise<boolean>;
	list(projectId: string): Promise<AiNote[]>;
}

/** Interchangeable model provider (Claude, local model…). Not wired to any feature in V1. */
export interface AiProvider {
	readonly available: boolean;
	complete(request: { system: string; context: ProjectContext; prompt: string }): Promise<string>;
}
