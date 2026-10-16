import type { ActiveTracePhase, SourceDocument, SourceEffort } from '../types/trace';
import { motion } from './tokens';

/** Discrete cycle tokens. Period = one full revolution. */
export type SpinCycle = SourceEffort;

export const SPIN_PERIOD_MS = {
  deep: motion.spin.deep * 1000,
  moderate: motion.spin.moderate * 1000,
  intense: motion.spin.intense * 1000,
} as const satisfies Record<SpinCycle, number>;

export const SPIN_ATTACK_MS = motion.spin.attack * 1000;
export const SPIN_RELEASE_MS = motion.spin.release * 1000;

const EFFORT_RANK: Record<SpinCycle, number> = {
  deep: 0,
  moderate: 1,
  intense: 2,
};

/**
 * Map model semantics onto discrete cycle tokens.
 *
 * - Query deliberation → `spin.deep`
 * - Structured clarification → `spin.moderate`
 * - The file currently being read uses its own `effort` (heavy commentary stays
 *   slow; a statute or index can run fast) so tempo means time-to-reason.
 */
export function spinCycleForPhase(
  phase: ActiveTracePhase,
  options?: { calm?: boolean; sources?: SourceDocument[] },
): SpinCycle {
  switch (phase) {
    case 'analyzing':
    case 'thinking':
      return 'deep';
    case 'clarifying':
      return 'moderate';
    case 'searching':
      return spinCycleForRetrieval(options?.sources ?? [], options?.calm);
  }
}

/** Active read uses that file's effort; otherwise the search breathes at the baseline. */
export function spinCycleForRetrieval(sources: SourceDocument[], calm?: boolean): SpinCycle {
  const reading = sources.filter((source) => source.status === 'indexing');
  if (reading.length > 0) {
    return reading.reduce<SpinCycle>((current, source) => {
      const effort = source.effort ?? 'moderate';
      return EFFORT_RANK[effort] > EFFORT_RANK[current] ? effort : current;
    }, 'deep');
  }
  if (sources.length === 0) return calm ? 'deep' : 'intense';
  return calm ? 'deep' : 'moderate';
}

function parseCssTime(raw: string, fallbackMs: number): number {
  const value = raw.trim();
  if (!value) return fallbackMs;
  if (value.endsWith('ms')) {
    const ms = Number.parseFloat(value);
    return Number.isFinite(ms) ? ms : fallbackMs;
  }
  if (value.endsWith('s')) {
    const seconds = Number.parseFloat(value);
    return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
  }
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : fallbackMs;
}

function readTimeToken(name: string, fallbackMs: number): number {
  if (typeof document === 'undefined') return fallbackMs;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  return parseCssTime(raw, fallbackMs);
}

/** Read a `--spin-*` token from the document, falling back to the TS table. */
export function readSpinPeriodMs(cycle: SpinCycle): number {
  return readTimeToken(`--spin-${cycle}`, SPIN_PERIOD_MS[cycle]);
}

export function readSpinAttackMs(): number {
  return readTimeToken('--spin-attack', SPIN_ATTACK_MS);
}

export function readSpinReleaseMs(): number {
  return readTimeToken('--spin-release', SPIN_RELEASE_MS);
}
