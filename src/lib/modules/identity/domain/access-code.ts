/** Registration without invitation needs the code set in the server configuration (none set = closed). */
export function matchesAccessCode(configured: string | null, given: string): boolean {
	if (!configured) return false;
	const expected = configured.trim();
	const actual = given.trim();
	// Constant-time comparison: the time taken must not reveal how many characters are right.
	let diff = expected.length ^ actual.length;
	for (let i = 0; i < expected.length; i++)
		diff |= expected.charCodeAt(i) ^ (actual.charCodeAt(i) || 0);
	return diff === 0;
}
