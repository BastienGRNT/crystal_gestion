import { fail, redirect } from '@sveltejs/kit';
import { DomainError } from '$lib/modules/kernel/domain/errors';
import { container } from '$lib/server/container';
import { field } from '$lib/server/http/auth-actions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	others: (await container.identity.listUsers()).filter((user) => user.id !== locals.user!.id),
	hasProjects: (await container.projects.listForUser(locals.user!.id)).length > 0
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const framing = {
			name: field(data, 'name'),
			objective: field(data, 'objective'),
			audience: field(data, 'audience'),
			deadline: field(data, 'deadline') || null,
			outOfScope: field(data, 'outOfScope'),
			doneDefinition: field(data, 'doneDefinition')
		};
		let slug: string;
		try {
			const project = await container.projects.create(locals.user!, framing);
			for (const userId of data.getAll('members'))
				await container.projects.addMember(project.id, String(userId));
			slug = project.slug;
		} catch (cause) {
			if (cause instanceof DomainError) return fail(400, { error: cause.message, ...framing });
			throw cause;
		}
		redirect(303, `/p/${slug}/project?welcome=1`);
	}
};
