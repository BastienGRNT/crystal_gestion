import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped, text, title } from '$lib/server/commands/schemas';
import type { ResourcesModule } from '..';

// No defaults here: a partial update must never reset fields it does not mention.
const short = text(500);
const featureId = id.nullable();
const target = projectScoped.extend({ id });

const account = z.object({
	title,
	login: short,
	secret: short,
	url: short,
	notes: text(),
	featureId
});
const link = z.object({ title, url: short, tag: text(60), featureId });
const contact = z.object({ title, role: short, email: short, phone: short, notes: text() });

export const resourceCommands = (resources: ResourcesModule) => ({
	'accounts.create': defineCommand(
		projectScoped.extend(account.partial().shape).extend({ title }),
		(actor, input) => resources.accounts.create(actor, input)
	),
	'accounts.update': defineCommand(target.extend({ changes: account.partial() }), (actor, input) =>
		resources.accounts.update(actor, input)
	),
	'accounts.delete': defineCommand(target, (actor, input) =>
		resources.accounts.remove(actor, input)
	),
	'links.create': defineCommand(
		projectScoped.extend(link.partial().shape).extend({ title }),
		(actor, input) => resources.links.create(actor, input)
	),
	'links.update': defineCommand(target.extend({ changes: link.partial() }), (actor, input) =>
		resources.links.update(actor, input)
	),
	'links.delete': defineCommand(target, (actor, input) => resources.links.remove(actor, input)),
	'contacts.create': defineCommand(
		projectScoped.extend(contact.partial().shape).extend({ title }),
		(actor, input) => resources.contacts.create(actor, input)
	),
	'contacts.update': defineCommand(target.extend({ changes: contact.partial() }), (actor, input) =>
		resources.contacts.update(actor, input)
	),
	'contacts.delete': defineCommand(target, (actor, input) =>
		resources.contacts.remove(actor, input)
	)
});
