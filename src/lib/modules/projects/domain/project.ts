export interface Framing {
	name: string;
	objective: string;
	audience: string;
	deadline: string | null;
	outOfScope: string;
	doneDefinition: string;
}

export interface Project extends Framing {
	id: string;
	slug: string;
	createdAt: string;
}

export type MemberRole = 'owner' | 'member';

export interface Member {
	/** The user id: members are users seen through a project. */
	id: string;
	name: string;
	email: string;
	color: string;
	role: MemberRole;
}

export function slugify(name: string): string {
	const slug = name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return slug.slice(0, 40) || 'projet';
}
