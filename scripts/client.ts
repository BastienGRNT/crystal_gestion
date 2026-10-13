/** Minimal HTTP client driving the real app routes, used by the demo seed and the screenshots. */
export class Client {
	private cookie = '';

	constructor(private base: string) {}

	get sessionCookie() {
		return this.cookie;
	}

	async form(path: string, fields: Record<string, string>) {
		const response = await fetch(`${this.base}${path}`, {
			method: 'POST',
			redirect: 'manual',
			// As a browser without JavaScript: a real redirect, and errors as HTTP statuses.
			headers: {
				origin: this.base,
				accept: 'text/html',
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

	async upload(
		name: string,
		type: string,
		body: string | Uint8Array,
		projectId: string,
		folderId: string | null,
		forMessage = false
	) {
		const params = new URLSearchParams({ id: crypto.randomUUID(), projectId });
		if (folderId) params.set('folderId', folderId);
		if (forMessage) params.set('for', 'message');
		const response = await fetch(`${this.base}/api/files?${params}`, {
			method: 'PUT',
			headers: {
				cookie: this.cookie,
				'content-type': type,
				'x-file-name': encodeURIComponent(name)
			},
			body
		});
		if (!response.ok)
			throw new Error(`upload ${name} → ${response.status} ${await response.text()}`);
		return response.json() as Promise<{ id: string }>;
	}
}
