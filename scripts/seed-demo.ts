import { DemoClient } from './demo-client';
import { dateKey, day, whoAmI, type Seed } from './seed/context';
import { seedResources } from './seed/resources';
import { seedTalk } from './seed/talk';
import { seedTime } from './seed/time';
import { seedWork } from './seed/work';

/** Empty database + `npm run dev` → a demo covering every feature of the app. */
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const PASSWORD = 'crystal-demo';

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
	const ana = await join(bastien, project.id, 'Ana', 'ana@crystal.test');
	const leo = await join(bastien, project.id, 'Léo', 'leo@crystal.test');
	const [b, a, l] = await Promise.all([whoAmI(bastien), whoAmI(ana), whoAmI(leo)]);
	const seed: Seed = { bastien, ana, leo, b, a, l, projectId: project.id, day, dateKey };
	const work = await seedWork(seed);
	const files = await seedResources(seed, work);
	await seedTalk(seed, work, files);
	await seedTime(seed, work);
	await sideProject(bastien);
	console.log(`Demo ready: ${BASE}/p/${project.slug} — bastien@crystal.test / ${PASSWORD}`);
}

/** A second, just-started project: shows the project switcher and the getting-started guide. */
async function sideProject(bastien: DemoClient) {
	const { id: projectId } = await bastien.command<{ id: string }>('projects.create', {
		...{
			name: 'Carnet de recettes',
			objective: 'Retrouver nos recettes de famille en deux clics',
			audience: 'La famille'
		},
		...{ deadline: null, outOfScope: '', doneDefinition: '' }
	});
	const feature = await bastien.command<{ id: string }>('features.create', {
		projectId,
		title: 'Recherche par ingrédient',
		priority: 'must',
		description: '',
		ownerId: null,
		doneCriteria: ''
	});
	await bastien.command('tasks.create', {
		projectId,
		title: 'Lister les 20 recettes à saisir',
		featureId: feature.id
	});
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
