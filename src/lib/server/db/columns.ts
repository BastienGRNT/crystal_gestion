import { timestamp } from 'drizzle-orm/pg-core';

export const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });
export const createdAt = () => timestamptz().notNull().defaultNow();

export const iso = (date: Date) => date.toISOString();
export const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);
