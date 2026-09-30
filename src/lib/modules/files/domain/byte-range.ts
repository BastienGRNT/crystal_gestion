/**
 * The part of a file asked by a `Range: bytes=…` header (videos need it to seek, Safari to play at all).
 * `null` means "send everything"; an unsatisfiable range is reported so the caller answers 416.
 */
export function byteRange(header: string | null, size: number) {
	const match = header?.match(/^bytes=(\d*)-(\d*)$/);
	if (!match || (!match[1] && !match[2])) return null;
	const [start, end] = match[1]
		? [Number(match[1]), match[2] ? Math.min(Number(match[2]), size - 1) : size - 1]
		: [Math.max(0, size - Number(match[2])), size - 1];
	return start > end || start >= size ? ('unsatisfiable' as const) : { start, end };
}
