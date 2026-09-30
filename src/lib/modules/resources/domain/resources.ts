import type { ElementBase } from '$lib/modules/kernel/domain/element';

interface ResourceBase extends ElementBase {
	projectId: string;
	createdAt: string;
}

export interface AccountFields {
	title: string;
	login: string;
	secret: string;
	url: string;
	notes: string;
	featureId: string | null;
}

export interface LinkFields {
	title: string;
	url: string;
	tag: string;
	featureId: string | null;
}

export interface ContactFields {
	title: string;
	role: string;
	email: string;
	phone: string;
	notes: string;
}

export interface Account extends ResourceBase, AccountFields {
	kind: 'account';
}

export interface Link extends ResourceBase, LinkFields {
	kind: 'link';
}

export interface Contact extends ResourceBase, ContactFields {
	kind: 'contact';
}
