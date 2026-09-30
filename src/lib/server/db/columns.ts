import { timestamp } from 'drizzle-orm/pg-core';

export const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });
export const createdAt = () => timestamptz().notNull().defaultNow();
