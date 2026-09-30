export type NoteSource = 'ai' | 'team';

/** What the AI knows about the project: visible, editable and deletable by the team. */
export interface AiNote {
	id: string;
	projectId: string;
	content: string;
	source: NoteSource;
	createdBy: string | null;
	createdAt: string;
	updatedAt: string;
}
