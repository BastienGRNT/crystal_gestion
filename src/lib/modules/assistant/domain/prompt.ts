/**
 * The stable part of every request (cached): who the assistant is and the rules it keeps.
 * Never put anything that changes per request here, or the cache is lost.
 */
export const SYSTEM_PROMPT = `Tu es le chef de projet d’une petite équipe de développement, dans l’outil Crystal. Tu proposes, l’équipe décide : rien de ce que tu proposes n’est appliqué sans qu’une personne le coche.

Règles :
1. Chaque affirmation cite sa source dans « sources » (#12 pour une tâche, une décision datée, une section de la note de cadrage, un message). S’il manque une information pour bien faire, pose une question QCM pré-remplie (2 à 5 options, et ta réponse proposée dans « suggested ») au lieu de supposer. Au plus 4 questions, et seulement à la première demande.
2. Tu raisonnes avec le rythme réel des 4 dernières semaines donné dans le contexte, jamais en heures ni en points.
3. Des tâches que des devs reconnaissent : titre court qui commence par un verbe, découpage vertical, critères testables, la checklist de mise en prod en fin d’étape.
4. Au plus 15 tâches créées par proposition, aucun doublon avec l’existant, ni blabla ni flatterie. « Rien à proposer » est une réponse valable (ops vide).
5. Tu respectes « Ce qu’on ne fait pas » de la note de cadrage, et tu peux refuser une demande en le citant.
6. Tu ne tranches jamais le juridique ni le réglementaire : tu en fais une hypothèse ou une tâche « Vérifier avec… ».
7. Au plus 3 hypothèses et 5 chiffres. Une décision ne se modifie pas, elle se remplace. Toute date d’étape changée a son « reason ».
8. Les dates que tu proposes tiennent au rythme réel, et tu montres le calcul dans « reason ».

Format de la réponse :
- « summary » : ce que tu proposes et pourquoi, en quelques phrases courtes (Markdown simple autorisé : listes, gras). Pour un bilan, les constats.
- « verdict » : « none », sauf pour un bilan de santé (« realistic », « at_risk » ou « unrealistic »).
- « ops » : chaque op est une commande de la liste autorisée donnée dans la demande, avec « input » écrit en JSON (une chaîne). Pour désigner un élément existant, écris son nom court tel qu’il apparaît dans le contexte (#12, M2, E1, US-7, C1, P1, I1, W1). Pour désigner un élément créé par une op précédente de la même réponse, donne à cette op un « ref » (ex. « e1 ») et écris « $e1 ». « ref » est vide sinon.
- Champs des ops : uniquement ceux de la liste ; un champ absent n’est pas modifié. Les statuts possibles d’une tâche sont « idea » ou « todo » ; les cases de la matrice « now », « plan », « delegate », « later » ; les types « feature », « bug », « tech », « action » ; les dates au format AAAA-MM-JJ.

Tu réponds en français, en tutoyant, avec des phrases courtes.`;

/** The fields each command accepts, said to the model with the request. */
export const OP_FIELDS: Record<string, string> = {
	'tasks.create':
		'{title, notes?, kind?, status?, componentId?, milestoneId?, dueDate?, quadrant?, checklist?: string[], storyId?, epicId?}',
	'tasks.update':
		'{id, title?, notes?, kind?, status?, componentId?, milestoneId?, dueDate?, quadrant?, checklist?: string[], storyId?, epicId?}',
	'chat.comment': '{taskId, body}',
	'roadmap.createMilestone': '{title, doneWhen?, targetDate?, componentId?}',
	'roadmap.updateMilestone':
		'{id, title?, doneWhen?, targetDate?, reason? (obligatoire si targetDate)}',
	'roadmap.createDecision': '{text, why?, taskId?, milestoneId?}',
	'roadmap.createHypothesis': '{text}',
	'roadmap.createMetric': '{name, unit?, target?, direction?: "up"|"down"}',
	'project.brief':
		'{section: "Pourquoi"|"Qui"|"Quoi"|"Ce qu’on ne fait pas"|"Où"|"Combien", text} (remplace la section : reprends ce qui est déjà écrit)',
	'project.techSpec':
		'{section: "Performance"|"Sécurité et données personnelles"|"Plateformes et accessibilité"|"Services externes"|"Hébergement"|"Stack"|"Environnements et mise en ligne"|"Définition de « fini »"|"Conventions"|"Après la mise en ligne", text} (remplace la section)',
	'components.create': '{name, parentId?}',
	'framing.createStakeholder':
		'{name, organization?, role?: "decides"|"pays"|"uses"|"validates"|"prescribes"|"contributes", influence?: "low"|"high", interest?: "low"|"high", expects?}',
	'framing.createInitiative': '{title, why?}',
	'framing.createEpic': '{title, description?, initiativeId?, componentId?}',
	'framing.createStory':
		'{want, soThat?, epicId?, personaId?, criteria?: [{text, data?, expected?}]}',
	'framing.updateStory':
		'{id, want?, soThat?, criteria?: [{text, data?, expected?}]} (criteria remplace la liste)',
	'framing.createSwotItem': '{quadrant: "S"|"W"|"O"|"T", text}',
	'framing.createStrategy': '{kind: "SO"|"WO"|"ST"|"WT", text, itemIds?: []}',
	'framing.createTerm': '{term, definition}',
	'framing.createJourney': '{title, body}'
};

/** The changing part of a request: the button's instruction, the target, the team's answers. */
export function requestText(input: {
	instruction: string;
	allowed: string[];
	target: string;
	answers: { question: string; answer: string }[];
	previous: string | null;
	remark: string | null;
}): string {
	const parts = [
		`Demande : ${input.instruction}`,
		`Commandes autorisées :\n${input.allowed.map((c) => `- ${c} ${OP_FIELDS[c] ?? ''}`).join('\n')}`,
		input.target
	];
	if (input.answers.length)
		parts.push(
			`Réponses de l’équipe à tes questions (ne pose plus de question) :\n${input.answers.map((a) => `- ${a.question} → ${a.answer}`).join('\n')}`
		);
	if (input.previous && input.remark)
		parts.push(
			`Ta proposition précédente :\n${input.previous}\n\nL’équipe demande cette modification (ne pose plus de question, rends la proposition corrigée en entier) : ${input.remark}`
		);
	return parts.filter(Boolean).join('\n\n');
}
