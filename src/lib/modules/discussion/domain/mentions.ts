const MENTION_PATTERN = /<@([0-9a-f-]{36})>/g;
const EXCERPT_LENGTH = 90;

export const mentionToken = (userId: string) => `<@${userId}>`;

export function extractMentions(body: string): string[] {
	return [...new Set(Array.from(body.matchAll(MENTION_PATTERN), (match) => match[1]))];
}

/** Plain-text version used as the message title in search, previews and notifications. */
export function excerpt(body: string, nameOf: (userId: string) => string | undefined): string {
	const plain = body
		.replace(MENTION_PATTERN, (_, id: string) => `@${nameOf(id) ?? 'quelqu’un'}`)
		.replace(/\s+/g, ' ')
		.trim();
	return plain.length > EXCERPT_LENGTH ? `${plain.slice(0, EXCERPT_LENGTH - 1)}…` : plain;
}

export type BodyToken = { type: 'text'; value: string } | { type: 'mention'; userId: string };

export function splitMentions(body: string): BodyToken[] {
	return body
		.split(/(<@[0-9a-f-]{36}>)/g)
		.filter(Boolean)
		.map((part) => {
			const match = /^<@([0-9a-f-]{36})>$/.exec(part);
			return match ? { type: 'mention', userId: match[1] } : { type: 'text', value: part };
		});
}
