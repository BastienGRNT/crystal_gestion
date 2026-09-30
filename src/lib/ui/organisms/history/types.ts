export interface BarRow {
	key: string;
	label: string;
	minutes: number;
	value: string;
	/** Member color; bars without one use the accent. */
	color?: string;
}

export interface WeekBar {
	key: string;
	label: string;
	minutes: number;
	value: string;
	current: boolean;
}

export interface DoneTask {
	id: string;
	ref: string;
	title: string;
	when: string;
	feature: string | null;
}
