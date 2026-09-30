/**
 * Everything an AI feature needs to reason about a project. Built from framing, features, tasks,
 * journal, references and activity so the AI can follow structural and free links alike.
 */
export interface ProjectContext {
	framing: Record<string, string | null>;
	features: { ref: string; title: string; priority: string; description: string }[];
	tasks: {
		ref: string;
		title: string;
		status: string;
		feature: string | null;
		dueDate: string | null;
	}[];
	journal: { ref: string; kind: string; title: string; details: Record<string, unknown> }[];
	references: { from: string; to: string }[];
	notes: string[];
}
