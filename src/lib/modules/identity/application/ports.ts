import type { Session } from '../domain/session';
import type { User, UserPreferences } from '../domain/user';

export interface NewUser {
	email: string;
	name: string;
	passwordHash: string;
	color: string;
}

export interface UserRepository {
	count(): Promise<number>;
	findById(id: string): Promise<User | null>;
	findCredentials(email: string): Promise<{ user: User; passwordHash: string } | null>;
	create(user: NewUser): Promise<User>;
	savePreferences(id: string, preferences: UserPreferences): Promise<User>;
	list(): Promise<User[]>;
}

export interface SessionRepository {
	create(id: string, session: Session): Promise<void>;
	find(id: string): Promise<Session | null>;
	extend(id: string, expiresAt: Date): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface PasswordHasher {
	hash(password: string): Promise<string>;
	verify(password: string, hash: string): Promise<boolean>;
}

export interface TokenService {
	generate(): string;
	hash(token: string): string;
}
