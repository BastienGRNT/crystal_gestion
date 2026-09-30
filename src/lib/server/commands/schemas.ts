import { z } from 'zod';

export const id = z.uuid();
export const projectScoped = z.object({ projectId: id });
export const dateKey = z.iso.date();
export const isoDateTime = z.iso.datetime({ offset: true });
export const text = (max = 20_000) => z.string().max(max);
export const title = z.string().trim().min(1).max(300);
