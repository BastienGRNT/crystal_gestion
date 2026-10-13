import type { ChangeFeed, Clock } from '../../kernel/application/ports';
import { conflict } from '../../kernel/domain/errors';
import { sessionExpiry } from '../domain/session';
import { nextColor, validEmail, validName, validPassword, type User } from '../domain/user';
import type {
	InvitationRepository,
	PasswordHasher,
	SessionRepository,
	TokenService,
	UserRepository
} from './ports';

export interface IdentityDeps {
	users: UserRepository;
	sessions: SessionRepository;
	invitations: InvitationRepository;
	hasher: PasswordHasher;
	tokens: TokenService;
	clock: Clock;
	feed: ChangeFeed<User>;
}

export interface AccountInput {
	name: string;
	email: string;
	password: string;
}

export async function openSession(deps: IdentityDeps, userId: string): Promise<string> {
	const token = deps.tokens.generate();
	const expiresAt = sessionExpiry(deps.clock.now());
	await deps.sessions.create({ tokenHash: deps.tokens.hash(token), userId, expiresAt });
	return token;
}

export async function createAccount(deps: IdentityDeps, input: AccountInput): Promise<User> {
	const email = validEmail(input.email);
	if (await deps.users.findByEmail(email)) throw conflict('Un compte existe déjà avec cet email.');
	const colors = (await deps.users.list()).map((user) => user.color);
	const user: User = {
		id: deps.tokens.uuid(),
		email,
		name: validName(input.name),
		color: nextColor(colors),
		status: 'available',
		statusNote: null,
		lastSeenAt: null,
		createdAt: deps.clock.now().toISOString()
	};
	await deps.users.create(user, await deps.hasher.hash(validPassword(input.password)));
	deps.feed.saved(user);
	return user;
}
