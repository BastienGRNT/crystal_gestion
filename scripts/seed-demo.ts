import { DemoClient } from './demo-client';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const PASSWORD = 'crystal-demo';
const day = (offset: number, hour = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offset);
	date.setHours(hour, 0, 0, 0);
	return date;
};
const dateKey = (offset: number) => day(offset).toLocaleDateString('sv-SE');

async function join(owner: DemoClient, projectId: string, name: string, email: string) {
	const { token } = await owner.command<{ token: string }>('projects.createInvitation', {
		projectId
	});
	const member = new DemoClient(BASE);
	await member.form(`/invite/${token}?/register`, { name, email, password: PASSWORD });
	return member;
}

async function main() {
	const bastien = new DemoClient(BASE);
	await bastien.form('/setup', {
		name: 'Bastien',
		email: 'bastien@crystal.test',
		password: PASSWORD
	});
	const project = await bastien.command<{ id: string; slug: string }>('projects.create', {
		name: 'Atelier Pixel',
		objective: 'Permettre aux illustrateurs indépendants de vendre leurs tirages en 10 minutes',
		audience: 'Illustrateurs freelances qui vendent déjà sur Instagram',
		deadline: dateKey(45),
		outOfScope: 'Pas de marketplace multi-vendeurs. Pas d’app mobile native.',
		doneDefinition:
			'Un illustrateur crée sa boutique, publie 3 tirages et encaisse une première commande.'
	});
	const projectId = project.id;
	const ana = await join(bastien, projectId, 'Ana', 'ana@crystal.test');
	const leo = await join(bastien, projectId, 'Léo', 'leo@crystal.test');
	const { seedContent } = await import('./seed-content');
	await seedContent({ bastien, ana, leo, projectId, day, dateKey });
	console.log(`Demo ready: ${BASE}/p/${project.slug} — bastien@crystal.test / ${PASSWORD}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
