export interface ToastAction {
	label: string;
	run: () => void;
}

export interface Toast {
	id: number;
	message: string;
	tone: 'info' | 'error' | 'success';
	action?: ToastAction;
}

interface ToastOptions {
	action?: ToastAction;
	/** Runs once when the toast goes away without its action being used. */
	onexpire?: () => void;
	duration?: number;
}

let nextId = 1;

class Toasts {
	items = $state<Toast[]>([]);
	#expire = new Map<number, () => void>();

	show(message: string, tone: Toast['tone'] = 'info', options: ToastOptions = {}) {
		const id = nextId++;
		this.items.push({ id, message, tone, action: options.action });
		if (options.onexpire) this.#expire.set(id, options.onexpire);
		setTimeout(() => this.dismiss(id), options.duration ?? (tone === 'error' ? 6000 : 3500));
	}

	error = (message: string) => this.show(message, 'error');
	success = (message: string) => this.show(message, 'success');

	/** Uses the toast action: the expiry callback is then skipped. */
	act(toast: Toast) {
		this.#expire.delete(toast.id);
		toast.action?.run();
		this.dismiss(toast.id);
	}

	dismiss(id: number) {
		this.#expire.get(id)?.();
		this.#expire.delete(id);
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

export const toasts = new Toasts();
