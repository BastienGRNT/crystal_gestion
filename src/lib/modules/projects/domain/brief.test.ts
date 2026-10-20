import { describe, expect, it } from 'vitest';
import { briefSections, isFramed, joinBrief, techSections } from './project';

describe('the framing note', () => {
	it('reads an older Cap into the QQOQCCP sections', () => {
		const old =
			'## Pour qui\n\nLes kinés\n\n## Leur problème\n\nLe téléphone\n\n## Qui paie, combien\n\nLe cabinet, 19 €';
		const sections = briefSections(old);
		expect(sections.Pourquoi).toBe('Le téléphone');
		expect(sections.Qui).toBe('Les kinés\n\nLe cabinet, 19 €');
		expect(sections.Quoi).toBe('');
	});

	it('keeps a free note in the first section and writes the sections back', () => {
		const sections = briefSections('Un texte libre');
		expect(sections.Pourquoi).toBe('Un texte libre');
		expect(briefSections(joinBrief(sections))).toEqual(sections);
	});

	it('is framed once why, who and what are said', () => {
		const brief = joinBrief({
			...briefSections(''),
			Pourquoi: 'Les RDV au téléphone',
			Qui: 'Les kinés seuls',
			Quoi: ''
		});
		expect(isFramed({ brief })).toBe(false);
		expect(
			isFramed({ brief: brief.replace('## Quoi\n\n', '## Quoi\n\nLa réservation en ligne') })
		).toBe(true);
	});

	it('splits the technical spec into its fixed sections', () => {
		expect(techSections('## Stack\n\nSvelteKit')).toMatchObject({
			Stack: 'SvelteKit',
			Performance: ''
		});
	});
});
