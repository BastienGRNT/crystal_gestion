import { makeBuildProjectContext } from '$lib/modules/ai/application/build-context';
import { makeNoteUseCases } from '$lib/modules/ai/application/notes';
import {
	drizzleAiNoteRepository,
	unavailableAiProvider
} from '$lib/modules/ai/infrastructure/ai-note-repository';
import { db } from '../db';
import type { Core } from './core';
import type { Work } from './work';

/** The AI memory and the project context it will read once a provider is plugged in. */
export function wireAi({ feed, projectRepository, elements }: Core, work: Work) {
	const notes = drizzleAiNoteRepository(db);
	return {
		notes: makeNoteUseCases({ notes, feed }),
		provider: unavailableAiProvider,
		context: makeBuildProjectContext({
			project: (id) => projectRepository.findById(id),
			...{ features: work.features.list, tasks: work.tasks.list, journal: work.journal.list },
			...{ elements: elements.listElements, references: elements.listReferences },
			notes: notes.list
		})
	};
}
