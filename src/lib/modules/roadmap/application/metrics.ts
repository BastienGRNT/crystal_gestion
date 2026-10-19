import { invalid, notFound } from '../../kernel/domain/errors';
import {
	ensureRoomForMetric,
	readingId,
	validMetricName,
	validMetricValue,
	validTarget,
	validUnit,
	validWeekOf,
	type Metric,
	type MetricReading
} from '../domain/metric';
import type { RoadmapDeps } from './ports';

export interface NewMetric {
	id: string;
	projectId: string;
	name: string;
	unit?: string;
	target?: number | null;
	direction?: Metric['direction'];
}

export type MetricPatch = Partial<
	Pick<Metric, 'name' | 'unit' | 'target' | 'direction' | 'position'> & { archived: boolean }
>;

async function existing(deps: RoadmapDeps, id: string, actorId: string) {
	const metric = await deps.metrics.get(id);
	if (!metric) throw notFound('Chiffre');
	await deps.access.assertMember(metric.projectId, actorId);
	return metric;
}

async function save(deps: RoadmapDeps, metric: Metric) {
	await deps.metrics.put(metric);
	deps.metricFeed.saved(metric);
	return metric;
}

export const createMetric = (deps: RoadmapDeps) => async (input: NewMetric, actorId: string) => {
	await deps.access.assertMember(input.projectId, actorId);
	const others = await deps.metrics.ofProject(input.projectId);
	ensureRoomForMetric(others);
	return save(deps, {
		id: input.id,
		projectId: input.projectId,
		name: validMetricName(input.name),
		unit: validUnit(input.unit ?? ''),
		target: validTarget(input.target ?? null),
		direction: input.direction ?? 'up',
		position: Math.max(0, ...others.map((m) => m.position)) + 1,
		archivedAt: null,
		createdAt: deps.clock.now().toISOString()
	});
};

export const updateMetric =
	(deps: RoadmapDeps) => async (id: string, patch: MetricPatch, actorId: string) => {
		const metric = await existing(deps, id, actorId);
		if (patch.archived === false && metric.archivedAt)
			ensureRoomForMetric(await deps.metrics.ofProject(metric.projectId));
		return save(deps, {
			...metric,
			...(patch.name !== undefined && { name: validMetricName(patch.name) }),
			...(patch.unit !== undefined && { unit: validUnit(patch.unit) }),
			...(patch.target !== undefined && { target: validTarget(patch.target) }),
			...(patch.direction !== undefined && { direction: patch.direction }),
			...(patch.position !== undefined && { position: patch.position }),
			...(patch.archived !== undefined && {
				archivedAt: patch.archived ? (metric.archivedAt ?? deps.clock.now().toISOString()) : null
			})
		});
	};

/** One value per week: typing it again the same week replaces it. */
export const recordReading =
	(deps: RoadmapDeps) =>
	async (input: { metricId: string; day: string; value: number }, actorId: string) => {
		const metric = await existing(deps, input.metricId, actorId);
		if (metric.archivedAt) throw invalid('Ce chiffre n’est plus suivi.');
		const weekOf = validWeekOf(input.day);
		const reading: MetricReading = {
			id: readingId(metric.id, weekOf),
			metricId: metric.id,
			projectId: metric.projectId,
			weekOf,
			value: validMetricValue(input.value),
			by: actorId,
			at: deps.clock.now().toISOString()
		};
		await deps.readings.put(reading);
		deps.readingFeed.saved(reading);
		return reading;
	};
