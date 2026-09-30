import { MOSCOW_LABELS } from '$lib/modules/features/domain/feature';
import type { ScopeChange } from '$lib/modules/features/domain/scope';

export function scopeTitle(featureTitle: string, change: ScopeChange): string {
	const name = `« ${featureTitle} »`;
	if (change.change === 'added') return `Ajout de ${name} en ${MOSCOW_LABELS[change.priority]}`;
	if (change.change === 'removed') return `Retrait de ${name}`;
	return `${name} : ${MOSCOW_LABELS[change.from]} → ${MOSCOW_LABELS[change.to]}`;
}
