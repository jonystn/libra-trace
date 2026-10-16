export type TraceState = 'active' | 'waiting' | 'done';

/** Retrieval pipeline state. */
export type SourceDocumentStatus = 'verified' | 'indexing' | 'unauthorized';

/**
 * Legal trust semantics shown on Source & Trust Pills (briefing §4 types).
 * - in_force: verified against official repository, currently valid
 * - superseded: cited but later law / overruled line affects reliance
 * - restricted: exists but no read/decrypt permission yet
 */
export type SourceTrustKind = 'in_force' | 'superseded' | 'restricted' | 'pending';

export interface CitationAudit {
  health: SourceTrustKind;
  /** Bold heading inside the citation popover. */
  title?: string;
  /** Corpus bucket shown beside the mark, e.g. "Statutes & Case Law". */
  collection?: string;
  excerpt: string;
  lastUpdated?: string;
  registryLabel?: string;
  detail?: string;
  /** Optional tag override, e.g. "Amended 2021". */
  trustLabel?: string;
  /** Libra/WK internal corpus — pill uses the WK roundel instead of a generic file icon. */
  fromInternalCorpus?: boolean;
}

/** How heavily the model is working this source — drives spinner tempo while `indexing`. */
export type SourceEffort = 'deep' | 'moderate' | 'intense';

export interface SourceDocument {
  id: string;
  name: string;
  status: SourceDocumentStatus;
  citation?: CitationAudit;
  /** Present while the model is reading this file. */
  effort?: SourceEffort;
}

export interface AuditStep {
  id: string;
  label: string;
  kind?: 'check' | 'search';
  /** Sources opened during this step (ids match session `SourceDocument.id`). */
  consultedSourceIds?: string[];
}

export interface WaitingBlock {
  documentName: string;
  reason: string;
}

export interface DoneSummary {
  durationSeconds: number;
  auditSteps: AuditStep[];
}

/** Progressive disclosure while the trace is active (matches Libra insight tray). */
export type ActiveTracePhase = 'analyzing' | 'thinking' | 'clarifying' | 'searching';

export interface ActiveTraceData {
  /** Defaults to `searching` when omitted (manual DevToolbar state). */
  phase?: ActiveTracePhase;
  message: string;
  sources: SourceDocument[];
}

export interface ActivePhaseFrame {
  atMs: number;
  phase: ActiveTracePhase;
}

export interface ReasoningTraceProps {
  state: TraceState;
  active: ActiveTraceData;
  waiting: WaitingBlock;
  done: DoneSummary;
  reduceMotion?: boolean;
  calmMotion?: boolean;
  onGrantAccess?: () => void;
  onDismissSource?: () => void;
  onOpenCitationAudit?: (document: SourceDocument) => void;
}

export type DemoScenarioId = 'quick' | 'dense' | 'blocked';

export interface SourceTimelineFrame {
  atMs: number;
  sources: SourceDocument[];
}

export interface DemoScenario {
  id: DemoScenarioId;
  label: string;
  active: ActiveTraceData;
  waiting: WaitingBlock;
  done: DoneSummary;
  stateTimeline?: Array<{ atMs: number; state: TraceState }>;
  sourceTimeline?: SourceTimelineFrame[];
  activePhaseTimeline?: ActivePhaseFrame[];
  completeAtMs?: number;
}
