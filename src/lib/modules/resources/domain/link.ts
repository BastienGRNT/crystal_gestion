/** One `tag` column holds comma-separated tags: several chips without a join table. */
export function linkTags(tag: string): string[] {
	return [
		...new Set(
			tag
				.split(',')
				.map((part) => part.trim())
				.filter(Boolean)
		)
	];
}

/** Only http(s) is ever put in an href, so a pasted `javascript:` URL stays inert. */
export function safeUrl(url: string): string {
	const trimmed = url.trim();
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed.replace(/^[a-z][a-z0-9+.-]*:\/*/i, '')}`;
}

export function domainOf(url: string): string {
	try {
		return new URL(safeUrl(url)).hostname.replace(/^www\./, '');
	} catch {
		return url.trim();
	}
}
