import { invalid, notFound } from '../../kernel/domain/errors';
import { PROJECT_COLORS } from '../../projects/domain/project';
import {
	ensureParentFits,
	ensureRoomForComponent,
	validComponentDescription,
	validComponentName,
	type Component
} from '../domain/component';
import type { TaskDeps } from './ports';

export interface ComponentPatch {
	name?: string;
	description?: string;
	parentId?: string | null;
	color?: number;
	position?: number;
	archived?: boolean;
}

async function existing(deps: TaskDeps, id: string, actorId: string) {
	const component = await deps.components.get(id);
	if (!component) throw notFound('Module');
	await deps.access.assertMember(component.projectId, actorId);
	return component;
}

const validColor = (color: number) => {
	if (!Number.isInteger(color) || color < 0 || color >= PROJECT_COLORS)
		throw invalid('Couleur inconnue.');
	return color;
};

export const createComponent =
	(deps: TaskDeps) =>
	async (
		input: {
			id: string;
			projectId: string;
			name: string;
			color?: number;
			parentId?: string | null;
		},
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		const others = await deps.components.ofProject(input.projectId);
		ensureRoomForComponent(others);
		const name = validComponentName(input.name);
		if (others.some((c) => c.name.toLowerCase() === name.toLowerCase() && !c.archivedAt))
			throw invalid('Ce module existe déjà.');
		ensureParentFits(others, input.id, input.parentId ?? null);
		const component: Component = {
			id: input.id,
			projectId: input.projectId,
			name,
			description: '',
			parentId: input.parentId ?? null,
			color: validColor(input.color ?? others.length % PROJECT_COLORS),
			position: Math.max(0, ...others.map((c) => c.position)) + 1,
			archivedAt: null,
			createdAt: deps.clock.now().toISOString()
		};
		await deps.components.put(component);
		deps.componentFeed.saved(component);
		return component;
	};

export const updateComponent =
	(deps: TaskDeps) => async (id: string, patch: ComponentPatch, actorId: string) => {
		const current = await existing(deps, id, actorId);
		if (patch.archived === false && current.archivedAt)
			ensureRoomForComponent(await deps.components.ofProject(current.projectId));
		if (patch.parentId !== undefined)
			ensureParentFits(await deps.components.ofProject(current.projectId), id, patch.parentId);
		const component: Component = {
			...current,
			...(patch.name !== undefined && { name: validComponentName(patch.name) }),
			...(patch.description !== undefined && {
				description: validComponentDescription(patch.description)
			}),
			...(patch.parentId !== undefined && { parentId: patch.parentId }),
			...(patch.color !== undefined && { color: validColor(patch.color) }),
			...(patch.position !== undefined && { position: patch.position }),
			...(patch.archived !== undefined && {
				archivedAt: patch.archived ? (current.archivedAt ?? deps.clock.now().toISOString()) : null
			})
		};
		await deps.components.put(component);
		deps.componentFeed.saved(component);
		return component;
	};

/** An empty module goes away; one that holds tasks is archived, so their history stays. */
export const deleteComponent = (deps: TaskDeps) => async (id: string, actorId: string) => {
	const component = await existing(deps, id, actorId);
	const used = (await deps.tasks.ofProjects([component.projectId])).some(
		(t) => t.componentId === id
	);
	for (const child of await deps.components.ofProject(component.projectId))
		if (child.parentId === id) {
			const top = { ...child, parentId: null };
			await deps.components.put(top);
			deps.componentFeed.saved(top);
		}
	if (used) return updateComponent(deps)(id, { archived: true }, actorId);
	await deps.components.delete(id);
	deps.componentFeed.removed(component);
	return null;
};
