const STEP = 15;
const pad = (n: number) => String(n).padStart(2, '0');

/** Quarter-hours left between now (rounded down) and midnight. */
export function quarterSteps(now: Date) {
	const start = Math.floor((now.getHours() * 60 + now.getMinutes()) / STEP) * STEP;
	return { start, max: (24 * 60 - start) / STEP };
}

export const clock = (minutes: number) =>
	minutes >= 24 * 60 ? '00:00' : `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

export const clockOf = (iso: string) => {
	const d = new Date(iso);
	return clock(d.getHours() * 60 + d.getMinutes());
};

export function rangeFrom(day: Date, start: number, steps: number) {
	const at = (minutes: number) =>
		new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, minutes).toISOString();
	return { startsAt: at(start), endsAt: at(start + steps * STEP) };
}

export const STEP_MINUTES = STEP;
