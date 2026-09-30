import type { DemoClient } from '../demo-client';

export type Created = { id: string; ref: string };

export interface Seed {
	bastien: DemoClient;
	ana: DemoClient;
	leo: DemoClient;
	/** User ids of Bastien, Ana and Léo. */
	b: string;
	a: string;
	l: string;
	projectId: string;
	/** A date `offset` days from today at the given time. */
	day: (offset: number, hour?: number, minute?: number) => Date;
	dateKey: (offset: number) => string;
}

export const day = (offset: number, hour = 0, minute = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offset);
	date.setHours(hour, minute, 0, 0);
	return date;
};

export const dateKey = (offset: number) => day(offset).toLocaleDateString('sv-SE');

export const whoAmI = async (client: DemoClient) =>
	(await client.command<{ id: string }>('identity.updatePreferences', {})).id;
