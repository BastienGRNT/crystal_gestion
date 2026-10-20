import type { Access, Clock } from '../../kernel/application/ports';
import type { TargetKind } from '../domain/actions';
import type { ProjectData } from '../domain/context';
import type { ModelSize, Usage } from '../domain/pricing';
import type { Proposal, RawProposal } from '../domain/proposal';

export interface LlmRequest {
	size: ModelSize;
	/** Stable, cached: the rules. */
	system: string;
	/** Stable for a while, cached: the project. */
	context: string;
	/** Changes every time: the button's ask. */
	request: string;
	maxTokens: number;
}

export interface LlmAnswer {
	raw: RawProposal;
	usage: Usage;
	/** The model that answered (a fallback may have). */
	model: string;
}

/** One call, a structured answer. Implemented by the Anthropic adapter. */
export interface LlmClient {
	configured(): boolean;
	propose(request: LlmRequest): Promise<LlmAnswer>;
}

export interface UsageRecord {
	id: string;
	projectId: string;
	userId: string;
	action: string;
	model: string;
	fingerprint: string;
	usage: Usage;
	costMicros: number;
	proposal: Proposal;
	createdAt: string;
}

export interface MonthUsage {
	projectId: string;
	requests: number;
	micros: number;
}

export interface UsageRepository {
	insert(record: UsageRecord): Promise<void>;
	/** Requests and spend per project since a date. */
	since(projectIds: string[], from: Date): Promise<MonthUsage[]>;
	/** The proposal already paid for with this exact fingerprint, if recent enough. */
	cached(fingerprint: string, from: Date): Promise<Proposal | null>;
}

/** Reads what the assistant may know of a project; never the vault. */
export interface ProjectReader {
	read(
		projectId: string,
		target: { kind: TargetKind; id: string | null },
		actorId: string
	): Promise<ProjectData>;
}

export interface AssistantDeps {
	llm: LlmClient;
	usage: UsageRepository;
	reader: ProjectReader;
	access: Access;
	clock: Clock;
	quota: { requests: number; micros: number };
	newId(): string;
}
