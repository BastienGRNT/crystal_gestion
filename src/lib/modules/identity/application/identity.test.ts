import { beforeEach, describe, expect, it } from 'vitest';
import { FixedClock, MemoryTable, RecordingFeed, testId } from '../../kernel/testing';
import type { Invitation } from '../domain/session';
import type { User } from '../domain/user';
import { createIdentity } from '../index';
import type { IdentityDeps } from './deps';

function memoryDeps(clock = new FixedClock()): IdentityDeps & { feed: RecordingFeed<User> } {
	const users = new MemoryTable<User>();
	const hashes = new Map<string, string>();
	const sessions = new Map<string, { userId: string; expiresAt: Date }>();
	const invitations = new Map<string, Invitation>();
	return {
		clock,
		feed: new RecordingFeed<User>(),
		hasher: {
			hash: async (password) => `hashed:${password}`,
			verify: async (password, stored) => stored === `hashed:${password}`
		},
		tokens: { generate: () => testId(), hash: (token) => `h:${token}`, uuid: testId },
		users: {
			count: async () => users.rows.size,
			list: async () => users.all(),
			findById: async (id) => users.get(id),
			findByEmail: async (email) => users.all().find((u) => u.email === email) ?? null,
			passwordHash: async (id) => hashes.get(id) ?? null,
			create: async (user, hash) => {
				users.put(user);
				hashes.set(user.id, hash);
			},
			update: async (id, patch) => {
				users.put({ ...users.get(id)!, ...patch });
				return users.get(id)!;
			},
			setPasswordHash: async (id, hash) => void hashes.set(id, hash)
		},
		sessions: {
			create: async ({ tokenHash, ...session }) => void sessions.set(tokenHash, session),
			find: async (hash) => sessions.get(hash) ?? null,
			renew: async (hash, expiresAt) => void (sessions.get(hash)!.expiresAt = expiresAt),
			delete: async (hash) => void sessions.delete(hash),
			deleteOthers: async (userId, keep) => {
				for (const [hash, s] of sessions)
					if (s.userId === userId && hash !== keep) sessions.delete(hash);
			}
		},
		invitations: {
			create: async (hash, invitation) => void invitations.set(hash, invitation),
			find: async (hash) => invitations.get(hash) ?? null,
			markUsed: async (hash, _userId, at) => void (invitations.get(hash)!.usedAt = at)
		}
	};
}

const bastien = { name: 'Bastien', email: 'bastien@crystal.test', password: 'motdepasse' };

describe('identity', () => {
	let deps: ReturnType<typeof memoryDeps>;
	let identity: ReturnType<typeof createIdentity>;
	beforeEach(() => {
		deps = memoryDeps();
		identity = createIdentity(deps);
	});

	it('creates the first account once, then refuses', async () => {
		const { user, token } = await identity.setupFirstUser(bastien);
		expect(await identity.authenticate(token)).toEqual(user);
		await expect(identity.setupFirstUser({ ...bastien, email: 'x@y.fr' })).rejects.toThrow(
			/existe déjà/
		);
	});

	it('logs in with the right password only', async () => {
		await identity.setupFirstUser(bastien);
		await expect(identity.login({ ...bastien, password: 'wrong-one' })).rejects.toThrow(
			/incorrect/
		);
		const { user } = await identity.login({
			email: 'BASTIEN@crystal.test ',
			password: 'motdepasse'
		});
		expect(user.name).toBe('Bastien');
	});

	it('forgets expired sessions', async () => {
		const { token } = await identity.setupFirstUser(bastien);
		(deps.clock as FixedClock).advance(31 * 86_400_000);
		expect(await identity.authenticate(token)).toBeNull();
	});

	it('lets an invited person join once, with a different color', async () => {
		const { user: host } = await identity.setupFirstUser(bastien);
		const { token } = await identity.createInvitation(host.id);
		expect(await identity.inspectInvitation(token)).toEqual({ invitedBy: 'Bastien' });
		const ana = { name: 'Ana', email: 'ana@crystal.test', password: 'motdepasse' };
		const { user } = await identity.acceptInvitation(token, ana);
		expect(user.color).not.toBe(host.color);
		await expect(identity.acceptInvitation(token, { ...ana, email: 'b@c.fr' })).rejects.toThrow(
			/expiré ou a déjà servi/
		);
	});

	it('broadcasts profile changes', async () => {
		const { user } = await identity.setupFirstUser(bastien);
		await identity.updateProfile(user.id, { status: 'focus', statusNote: '  ' });
		expect(deps.feed.last).toMatchObject({ status: 'focus', statusNote: null });
	});

	it('signs other devices out when the password changes', async () => {
		const { user, token } = await identity.setupFirstUser(bastien);
		const other = await identity.login(bastien);
		await identity.changePassword(user.id, { current: 'motdepasse', next: 'nouveau-mdp' }, token);
		expect(await identity.authenticate(token)).not.toBeNull();
		expect(await identity.authenticate(other.token)).toBeNull();
	});
});
