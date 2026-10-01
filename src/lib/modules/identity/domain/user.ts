export type TaskView = 'list' | 'kanban' | 'matrix';

export interface UserPreferences {
	taskView?: TaskView;
}

export interface User {
	id: string;
	email: string;
	name: string;
	color: string;
	preferences: UserPreferences;
}

export const USER_COLORS = [
	'#3D2BFF',
	'#E4572E',
	'#12A594',
	'#D6409F',
	'#E8A33D',
	'#5B8DEF',
	'#8E4EC6'
];

export const colorForIndex = (index: number) => USER_COLORS[index % USER_COLORS.length];

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
