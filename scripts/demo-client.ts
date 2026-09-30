/** Minimal HTTP client driving the real app routes, used by the demo seed and smoke checks. */
export class DemoClient {
	private cookie = '';

	constructor(private base: string) {}

	async form(path: string, fields: Record<string, string>) {
		const response = await fetch(`${this.base}${path}`, {
			method: 'POST',
			redirect: 'manual',
			headers: {
				origin: this.base,
				'content-type': 'application/x-www-form-urlencoded',
				cookie: this.cookie
			},
			body: new URLSearchParams(fields)
		});
		const setCookie = response.headers.get('set-cookie');
		if (setCookie) this.cookie = setCookie.split(';')[0];
		if (response.status >= 400)
			throw new Error(`${path} → ${response.status} ${await response.text()}`);
		return response;
	}

	async command<T = Record<string, unknown>>(name: string, input: object): Promise<T> {
		const response = await fetch(`${this.base}/api/commands/${name}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', cookie: this.cookie },
			body: JSON.stringify(input)
		});
		if (!response.ok) throw new Error(`${name} → ${response.status} ${await response.text()}`);
		return response.json() as Promise<T>;
	}

	/** Uploads a local file the way the app's drop zone does. */
	async upload(projectId: string, path: string, type: string, featureId: string | null = null) {
		const { readFileSync } = await import('node:fs');
		const body = new FormData();
		body.set('file', new File([readFileSync(path)], path.split('/').pop()!, { type }));
		if (featureId) body.set('featureId', featureId);
		const response = await fetch(`${this.base}/api/projects/${projectId}/files`, {
			method: 'POST',
			headers: { cookie: this.cookie, origin: this.base },
			body
		});
		if (!response.ok)
			throw new Error(`upload ${path} → ${response.status} ${await response.text()}`);
		return response.json() as Promise<{ id: string; ref: string }>;
	}

	get sessionCookie() {
		return this.cookie;
	}
}
