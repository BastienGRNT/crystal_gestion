import type { User } from '../domain/user';

export type ProfilePatch = Partial<Pick<User, 'name' | 'color' | 'status' | 'statusNote'>>;

export interface UserRepository {
	count(): Promise<number>;
	list(): Promise<User[]>;
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	passwordHash(userId: string): Promise<string | null>;
	create(user: User, passwordHash: string): Promise<void>;
	update(id: string, patch: ProfilePatch & { lastSeenAt?: string }): Promise<User>;
	setPasswordHash(id: string, hash: string): Promise<void>;
}

export interface SessionRepository {
	create(session: { tokenHash: string; userId: string; expiresAt: Date }): Promise<void>;
	find(tokenHash: string): Promise<{ userId: string; expiresAt: Date } | null>;
	renew(tokenHash: string, expiresAt: Date): Promise<void>;
	delete(tokenHash: string): Promise<void>;
	deleteOthers(userId: string, keepTokenHash: string): Promise<void>;
}

export interface PasswordHasher {
	hash(password: string): Promise<string>;
	verify(password: string, stored: string): Promise<boolean>;
}

export interface TokenService {
	generate(): string;
	hash(token: string): string;
	uuid(): string;
}
