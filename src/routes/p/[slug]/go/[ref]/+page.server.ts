import { error, redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { requireMember } from '$lib/server/http/guard';
import type { PageServerLoad } from './$types';

/** Stable link for any reference: resolves it to where the element actually lives. */
export const load: PageServerLoad = async ({ params, locals }) => {
	const project = await container.projects.findBySlug(params.slug);
	if (!project) error(404, 'Projet introuvable');
	await requireMember(locals, project.id);
	const element = await container.elements.findByRef(project.id, params.ref);
	if (!element) error(404, `${params.ref} introuvable`);
	const base = `/p/${project.slug}`;
	if (element.kind === 'feature') redirect(303, `${base}/features/${element.ref}`);
	if (element.kind !== 'message') redirect(303, `${base}?peek=${element.ref}`);
	const message = await container.discussion.findMessage(project.id, element.id);
	const feature = message?.featureId
		? await container.features.find(project.id, message.featureId)
		: null;
	redirect(303, `${base}/discussion${feature ? `/${feature.ref}` : ''}#${element.ref}`);
};
