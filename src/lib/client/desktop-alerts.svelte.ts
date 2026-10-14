import type { AlertLevel, DesktopAlert } from './views/alerts';

export type AlertPermission = NotificationPermission | 'unsupported';

const KEY = 'crystal-desktop-alerts';

function storedLevel(): AlertLevel {
	try {
		const value = localStorage.getItem(KEY);
		return value === 'mine' || value === 'all' ? value : 'off';
	} catch {
		return 'off';
	}
}

const currentPermission = (): AlertPermission =>
	typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

/** Browser notifications, chosen per device. Only shown while I look elsewhere. */
class DesktopAlerts {
	level = $state<AlertLevel>(storedLevel());
	permission = $state<AlertPermission>(currentPermission());

	/** What actually gets shown: nothing while the browser has not allowed it. */
	get effective(): AlertLevel {
		return this.permission === 'granted' ? this.level : 'off';
	}

	/** Must run from a click: browsers only ask for permission after a user gesture. */
	async enable(level: Exclude<AlertLevel, 'off'>) {
		if (this.permission === 'unsupported') return;
		const wasOff = this.effective === 'off';
		this.permission = await Notification.requestPermission();
		if (this.permission !== 'granted') return;
		this.choose(level);
		if (wasOff)
			this.notify({
				title: 'Notifications activées',
				body: 'Elles s’affichent quand Crystal est ouvert dans un onglet que tu ne regardes pas.',
				href: '',
				tag: 'crystal-alerts-on'
			});
	}

	choose(level: AlertLevel) {
		this.level = level;
		try {
			localStorage.setItem(KEY, level);
		} catch {
			// Private mode: the choice lasts until the tab closes.
		}
	}

	show(alert: DesktopAlert, open: (href: string) => void) {
		if (document.visibilityState === 'visible' && document.hasFocus()) return;
		this.notify(alert, open);
	}

	private notify(alert: DesktopAlert, open?: (href: string) => void) {
		try {
			const notification = new Notification(alert.title, {
				body: alert.body,
				tag: alert.tag,
				icon: '/favicon.svg'
			});
			notification.onclick = () => {
				window.focus();
				open?.(alert.href);
				notification.close();
			};
		} catch {
			// Android Chrome only shows notifications from a service worker.
		}
	}
}

export const desktopAlerts = new DesktopAlerts();
