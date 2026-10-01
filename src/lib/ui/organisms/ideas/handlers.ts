/** What can be done to an idea from a list row. */
export interface IdeaHandlers {
	ontask: () => void;
	onfeature: () => void;
	onarchive: (archived: boolean) => void;
	/** Untriaged ideas only: keep it for later, it leaves « À trier ». */
	onkeep?: () => void;
	onremove: () => void;
}
