import { describe, expect, it } from 'vitest';
import { canRemove, isUsable, type Member } from './membership';

const member = (userId: string, role: Member['role']): Member => ({
	id: `p:${userId}`,
	projectId: 'p',
	userId,
	role,
	joinedAt: '2026-10-01T00:00:00Z'
});

describe('team rules', () => {
	const owner = member('bastien', 'owner');
	const ana = member('ana', 'member');
	const team = [owner, ana];

	it('lets anyone leave and only owners remove others', () => {
		expect(canRemove(ana, ana, team)).toBeNull();
		expect(canRemove(ana, owner, team)).toMatch(/responsable/);
		expect(canRemove(owner, ana, team)).toBeNull();
	});

	it('always keeps an owner', () => {
		expect(canRemove(owner, owner, team)).toMatch(/au moins un responsable/);
	});

	it('refuses used or expired invitations', () => {
		const now = new Date('2026-10-13T10:00:00Z');
		const base = {
			projectId: 'p',
			createdBy: 'bastien',
			expiresAt: new Date('2026-10-14'),
			usedAt: null
		};
		expect(isUsable(base, now)).toBe(true);
		expect(isUsable({ ...base, usedAt: now }, now)).toBe(false);
		expect(isUsable({ ...base, expiresAt: new Date('2026-10-12') }, now)).toBe(false);
	});
});
