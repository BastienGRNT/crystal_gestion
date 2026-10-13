export interface Toast {
	id: number;
	message: string;
	tone: 'info' | 'error' | 'success';
	action?: { label: string; run: () => void };
}

let counter = 0;

class Toasts {
	items = $state<Toast[]>([]);

	show(
		message: string,
		options: Omit<Partial<Toast>, 'id' | 'message'> & { duration?: number } = {}
	) {
		const toast: Toast = {
			id: ++counter,
			message,
			tone: options.tone ?? 'info',
			action: options.action
		};
		this.items = [...this.items.slice(-2), toast];
		setTimeout(() => this.dismiss(toast.id), options.duration ?? 4000);
		return toast.id;
	}

	error(message: string) {
		return this.show(message, { tone: 'error', duration: 6000 });
	}

	dismiss(id: number) {
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

export const toasts = new Toasts();

const UNDO_MS = 6000;
const pending = new Set<() => void>();

/**
 * Deletions happen on screen at once, with "Annuler" for a few seconds; the server is only told
 * when the toast expires (or the page closes), so undoing never needs a server-side restore.
 */
export function deleteWithUndo(
	message: string,
	hide: () => void,
	restore: () => void,
	commit: () => void
) {
	hide();
	let done = false;
	const finish = () => {
		if (done) return;
		done = true;
		pending.delete(finish);
		commit();
	};
	pending.add(finish);
	const timer = setTimeout(finish, UNDO_MS);
	toasts.show(message, {
		duration: UNDO_MS,
		action: {
			label: 'Annuler',
			run: () => {
				done = true;
				pending.delete(finish);
				clearTimeout(timer);
				restore();
			}
		}
	});
}

export const flushPendingDeletions = () => [...pending].forEach((finish) => finish());
