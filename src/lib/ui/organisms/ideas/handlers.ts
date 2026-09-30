/** What can be done to an idea from a list row. */
export interface IdeaHandlers {
	ontask: () => void;
	onfeature: () => void;
	onarchive: (archived: boolean) => void;
	onremove: () => void;
}
