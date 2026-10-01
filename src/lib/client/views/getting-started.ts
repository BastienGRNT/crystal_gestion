export interface StartStep {
	key: string;
	label: string;
	hint: string;
	path: string;
	done: boolean;
}

interface ProjectState {
	objective: string;
	featureCount: number;
	taskCount: number;
	memberCount: number;
	myAvailabilityCount: number;
	myTaskCount: number;
}

/** What a new project, or a new member, should do first; derived from the data, nothing to tick by hand. */
export function startSteps(s: ProjectState): StartStep[] {
	return [
		{
			key: 'objective',
			label: 'Écris l’objectif du projet',
			hint: 'Une phrase : à quoi sert ce que vous construisez ?',
			path: '/project',
			done: !!s.objective.trim()
		},
		{
			key: 'features',
			label: 'Crée les Feats',
			hint: 'Les gros morceaux du produit : bouton + à côté de « Feats », à gauche.',
			path: '/tasks',
			done: s.featureCount > 0
		},
		{
			key: 'tasks',
			label: 'Découpe-les en Tasks',
			hint: 'Dans Gestion, sous chaque Feat : « Ajouter une Task ».',
			path: '/tasks',
			done: s.taskCount > 0
		},
		{
			key: 'team',
			label: 'Invite l’équipe',
			hint: 'Un lien d’invitation à envoyer, valable 7 jours.',
			path: '/project#equipe',
			done: s.memberCount > 1
		},
		{
			key: 'availability',
			label: 'Dis quand tu es dispo',
			hint: 'Les autres sauront quand travailler avec toi.',
			path: '/planning',
			done: s.myAvailabilityCount > 0
		},
		{
			key: 'mine',
			label: 'Prends une Task',
			hint: 'Assigne-toi une Task et démarre le chrono.',
			path: '/tasks',
			done: s.myTaskCount > 0
		}
	];
}
