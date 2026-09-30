export interface Toast {
	id: number;
	message: string;
	tone: 'info' | 'error' | 'success';
}

let nextId = 1;

class Toasts {
	items = $state<Toast[]>([]);

	show(message: string, tone: Toast['tone'] = 'info') {
		const id = nextId++;
		this.items.push({ id, message, tone });
		setTimeout(() => this.dismiss(id), tone === 'error' ? 6000 : 3500);
	}

	error = (message: string) => this.show(message, 'error');
	success = (message: string) => this.show(message, 'success');

	dismiss(id: number) {
		this.items = this.items.filter((toast) => toast.id !== id);
	}
}

export const toasts = new Toasts();
