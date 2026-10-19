import { daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import { TEMPLATES, TEMPLATE_KEYS, type TemplateKey } from '$lib/modules/roadmap/domain/templates';
import type { TemplateOption } from '$lib/ui/types';

export const templateOptions = (withEmpty = true): TemplateOption<TemplateKey>[] =>
	TEMPLATE_KEYS.filter((key) => withEmpty || key !== 'empty').map((key) => ({
		key,
		name: TEMPLATES[key].name,
		summary: TEMPLATES[key].summary,
		steps: TEMPLATES[key].steps.map((s) => s.title)
	}));

/** Until someone picks one: a month or less reads as an express project, longer as a product. */
export function suggestedTemplate(deadline: DateKey | null, today: DateKey): TemplateKey {
	return deadline && daysBetween(today, deadline) <= 31 ? 'express' : 'product';
}
