export interface Trigger {
	symbol: '#' | '@';
	query: string;
	start: number;
}

const TRIGGER_PATTERN = /(^|\s)([#@])([^\s#@]{0,40})$/;

/** Finds an in-progress `#ref` or `@name` right before the caret. */
export function findTrigger(text: string, caret: number): Trigger | null {
	const match = TRIGGER_PATTERN.exec(text.slice(0, caret));
	if (!match) return null;
	return {
		symbol: match[2] as Trigger['symbol'],
		query: match[3],
		start: caret - match[3].length - 1
	};
}

export function insertAt(text: string, trigger: Trigger, caret: number, insertion: string) {
	const next = `${text.slice(0, trigger.start)}${insertion} ${text.slice(caret)}`;
	return { text: next, caret: trigger.start + insertion.length + 1 };
}
