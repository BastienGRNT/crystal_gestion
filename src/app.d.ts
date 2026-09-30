import type { User } from '$lib/modules/identity/domain/user';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
		}
		interface Error {
			message: string;
		}
	}
}

export {};
