/** Shared passwords go through this port: plain text in V1, real encryption later without touching use cases. */
export interface SecretCipher {
	encrypt(plain: string): string;
	decrypt(stored: string): string;
}
