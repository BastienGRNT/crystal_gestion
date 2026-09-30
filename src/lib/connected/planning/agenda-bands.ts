import { daySegment } from '$lib/modules/planning/domain/calendar';
import type { Availability } from '$lib/modules/planning/domain/availability';
import { sharedRanges } from '$lib/modules/planning/domain/shared';
import type { SharedBand } from '$lib/ui/organisms/agenda/types';

/** Moments of each day when at least two members are surely available ("peut-être" does not count). */
export function sharedBands(
	days: Date[],
	availabilities: Availability[],
	nameOf: (userId: string) => string
): SharedBand[] {
	const sure = availabilities.filter((slot) => slot.status === 'available');
	return days.flatMap((day, index) => {
		const spans = sure.flatMap((slot) => {
			const segment = daySegment(day, slot.startsAt, slot.endsAt);
			return segment ? [{ owner: slot.userId, start: segment.start, end: segment.end }] : [];
		});
		return sharedRanges(spans).map((range) => ({
			day: index,
			start: range.start,
			end: range.end,
			names: range.owners.map(nameOf)
		}));
	});
}
