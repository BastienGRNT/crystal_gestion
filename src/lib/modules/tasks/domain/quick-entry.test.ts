import { describe, expect, it } from 'vitest';
import { branchName, commitMessage, guessKind } from './kind';
import { parseDay, parseQuickEntry } from './quick-entry';

const people = [
	{ id: 'u-bastien', name: 'Bastien Grenot' },
	{ id: 'u-ana', name: 'Ana Lefèvre' }
];
// Tuesday
const today = '2026-10-13';

describe('quick entry', () => {
	it('reads who and when from the end of the title', () => {
		expect(parseQuickEntry('Corriger le login @ana demain', people, today)).toMatchObject({
			title: 'Corriger le login',
			assigneeId: 'u-ana',
			dueDate: '2026-10-14'
		});
	});

	it('leaves a date in the middle of the title alone', () => {
		const entry = parseQuickEntry('Préparer demain la démo', people, today);
		expect(entry).toMatchObject({ title: 'Préparer demain la démo', dueDate: null });
	});

	it('ignores unknown people and keeps them in the title', () => {
		expect(parseQuickEntry('Appeler @paul', people, today).title).toBe('Appeler @paul');
	});

	it('understands @moi', () => {
		expect(parseQuickEntry('Relire @moi', people, today, 'u-bastien').assigneeId).toBe('u-bastien');
	});

	it('never empties the title', () => {
		expect(parseQuickEntry('demain', people, today)).toMatchObject({
			title: 'demain',
			dueDate: null
		});
	});
});

describe('days', () => {
	it('knows relative words and the next weekday', () => {
		expect(parseDay("aujourd'hui", today)).toBe(today);
		expect(parseDay('Après-demain', today)).toBe('2026-10-15');
		expect(parseDay('vendredi', today)).toBe('2026-10-16');
		expect(parseDay('mardi', today)).toBe('2026-10-20');
	});

	it('reads day/month, rolling to next year when already past', () => {
		expect(parseDay('15/11', today)).toBe('2026-11-15');
		expect(parseDay('3/1', today)).toBe('2027-01-03');
		expect(parseDay('31/02', today)).toBeNull();
		expect(parseDay('12/12/2027', today)).toBe('2027-12-12');
	});
});

describe('kind of work', () => {
	const modules = [
		{ id: 'c-rdv', name: 'Prise de RDV' },
		{ id: 'c-site', name: 'Site' }
	];

	it('reads a prefix, a blocking bug and a module', () => {
		expect(
			parseQuickEntry(
				'bug!: le paiement plante +site @ana demain',
				people,
				today,
				undefined,
				modules
			)
		).toEqual({
			title: 'le paiement plante',
			assigneeId: 'u-ana',
			dueDate: '2026-10-14',
			kind: 'bug',
			kindSaid: true,
			critical: true,
			componentId: 'c-site',
			reportedBy: null,
			storyId: null,
			epicId: null
		});
		expect(
			parseQuickEntry('fix: horaires ~mart', people, today, undefined, [], ['Pharmacie Martin'])
				.reportedBy
		).toBe('Pharmacie Martin');
		expect(parseQuickEntry('fix: horaires ~Dr_Lemoine', people, today).reportedBy).toBe(
			'Dr Lemoine'
		);
		expect(parseQuickEntry('feat: export PDF', people, today)).toMatchObject({
			title: 'export PDF',
			kind: 'feature',
			critical: false
		});
		expect(parseQuickEntry('chore: mettre à jour Svelte', people, today).kind).toBe('tech');
	});

	it('guesses the kind from the first words when nothing says it', () => {
		expect(guessKind('Corriger les horaires')).toBe('bug');
		expect(guessKind('Le formulaire ne marche plus sur iPhone')).toBe('bug');
		expect(guessKind('Appeler la pharmacie Dupont')).toBe('action');
		expect(guessKind('Mettre à jour les dépendances')).toBe('tech');
		expect(guessKind('Page des horaires')).toBe('feature');
		// A word that only looks like a prefix stays in the title.
		expect(parseQuickEntry('Note: penser au logo', people, today)).toMatchObject({
			title: 'Note: penser au logo',
			kindSaid: false
		});
	});

	it('names the branch and the commit', () => {
		const task = { kind: 'bug' as const, number: 12, title: 'Les horaires du samedi' };
		expect(branchName(task)).toBe('fix/12-horaires-samedi');
		expect(commitMessage(task, 'Prise de RDV')).toBe(
			'fix(prise-rdv): les horaires du samedi (#12)'
		);
		expect(branchName({ ...task, kind: 'action' })).toBeNull();
	});

	it('reads ^ as the epic or the story the task builds', () => {
		const targets = [
			{ id: 'e1', kind: 'epic' as const, name: 'Prise de rendez-vous' },
			{ id: 'e2', kind: 'epic' as const, name: 'Facturation' },
			{ id: 's7', kind: 'story' as const, name: 'réserver sans compte', number: 7 }
		];
		const epic = parseQuickEntry(
			'feat: export PDF ^fact',
			[],
			'2026-10-19',
			undefined,
			[],
			[],
			targets
		);
		expect(epic).toMatchObject({ title: 'export PDF', epicId: 'e2', storyId: null });
		const byWord = parseQuickEntry('agenda ^rendez', [], '2026-10-19', undefined, [], [], targets);
		expect(byWord.epicId).toBe('e1');
		const story = parseQuickEntry('formulaire ^US-7', [], '2026-10-19', undefined, [], [], targets);
		expect(story).toMatchObject({ title: 'formulaire', storyId: 's7', epicId: null });
		expect(parseQuickEntry('a ^zz', [], '2026-10-19', undefined, [], [], targets).title).toBe(
			'a ^zz'
		);
	});
});
