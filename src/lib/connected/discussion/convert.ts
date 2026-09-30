import type { Actions } from '$lib/client/actions';
import { decodeMentions } from '$lib/client/refs/mentions';
import type { Message } from '$lib/modules/discussion/domain/message';
import type { ConvertKind } from '$lib/ui/discussion';

type Person = { id: string; name: string };

/** Turns a message into a real element; the "Depuis #M-12" line creates the backlink. */
export function convertMessage(
	actions: Actions,
	message: Message,
	kind: ConvertKind,
	people: Person[]
): Promise<{ ref: string } | undefined> {
	const truncated = message.title.endsWith('…');
	const body = truncated ? `${decodeMentions(message.body, people)}\n\n` : '';
	const text = `${body}Depuis #${message.ref}`;
	const common = { title: message.title, featureId: message.featureId };
	const create: Record<ConvertKind, () => Promise<{ ref: string } | undefined>> = {
		decision: () =>
			actions.journal.create({
				...common,
				kind: 'decision',
				details: { rationale: text, decidedBy: [], decidedOn: null }
			}),
		fix: () => actions.journal.create({ ...common, kind: 'fix', details: { problem: text } }),
		task: () => actions.tasks.create({ ...common, description: text }),
		idea: () => actions.ideas.create({ ...common, note: text })
	};
	return create[kind]();
}
