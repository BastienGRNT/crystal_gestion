import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { ElementBase } from '$lib/modules/kernel/domain/element';

type Creator<Input> = (actor: Actor, input: Input) => Promise<ElementBase>;

/** Idea conversions reuse the task and feature use cases without depending on their modules. */
export interface IdeaConverters {
	createTask: Creator<{
		projectId: string;
		title: string;
		description: string;
		featureId: string | null;
	}>;
	createFeature: Creator<{
		projectId: string;
		title: string;
		description: string;
		priority: 'could';
	}>;
}
