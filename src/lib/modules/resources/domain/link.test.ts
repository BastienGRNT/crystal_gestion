import { describe, expect, it } from 'vitest';
import { domainOf, linkTags, safeUrl } from './link';

describe('resource links', () => {
	it('splits comma-separated tags without duplicates', () => {
		expect(linkTags(' design, doc ,design,, ')).toEqual(['design', 'doc']);
		expect(linkTags('')).toEqual([]);
	});

	it('only produces http(s) hrefs', () => {
		expect(safeUrl('https://figma.com/x')).toBe('https://figma.com/x');
		expect(safeUrl('figma.com')).toBe('https://figma.com');
		expect(safeUrl('javascript:alert(1)')).toBe('https://alert(1)');
	});

	it('shows the domain of a url', () => {
		expect(domainOf('https://www.figma.com/file/abc')).toBe('figma.com');
		expect(domainOf('dashboard.stripe.com/test')).toBe('dashboard.stripe.com');
	});
});
