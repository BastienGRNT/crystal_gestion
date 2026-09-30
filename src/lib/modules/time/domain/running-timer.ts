import type { TimeEntry } from './time-entry';

/** The person's live timer, shown everywhere in the app whatever project is open. */
export interface RunningTimer {
	entry: TimeEntry;
	task: { ref: string; title: string };
	project: { slug: string; name: string };
}
