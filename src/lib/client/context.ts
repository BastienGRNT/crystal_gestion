import { getContext, setContext } from 'svelte';
import type { Actions } from './actions';
import type { Overlays } from './overlays.svelte';
import type { Realtime } from './realtime.svelte';
import type { AppState } from './state/app.svelte';

export interface AppContext {
	app: AppState;
	actions: Actions;
	realtime: Realtime;
	overlays: Overlays;
}

const KEY = Symbol('crystal');

export const provideApp = (context: AppContext) => setContext(KEY, context);

export function useApp(): AppContext {
	const context = getContext<AppContext | undefined>(KEY);
	if (!context) throw new Error('useApp() is only available inside the app layout');
	return context;
}
