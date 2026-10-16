import type { SourceTrustKind } from '../../types/trace';

const BADGE: Record<
  SourceTrustKind,
  { label: string; className: string; defaultShort: string }
> = {
  in_force: {
    label: 'Validated • In force',
    defaultShort: 'In force',
    className: 'border-origin-success-line bg-origin-success-fill font-medium text-origin-success',
  },
  superseded: {
    label: 'Attention • Amended / superseded',
    defaultShort: 'Amended',
    className:
      'border-[color:var(--origin-color-border-warning-subdued)] bg-[var(--origin-color-fill-premium-subdued)] font-medium text-[color:var(--origin-color-orange-contrast-low)]',
  },
  restricted: {
    label: 'Inaccessible • Permission pending',
    defaultShort: 'Restricted access',
    className: 'border-origin-critical-line bg-origin-critical-fill font-medium text-origin-critical',
  },
  pending: {
    label: 'Validating citation…',
    defaultShort: 'Validating…',
    className: 'border-origin-line bg-origin-subdued font-medium text-origin-ink-subdued',
  },
};

interface CitationTrustBadgeProps {
  health: SourceTrustKind;
  trustLabel?: string;
  reduceMotion?: boolean;
}

export function CitationTrustBadge({ health, trustLabel, reduceMotion }: CitationTrustBadgeProps) {
  const badge = BADGE[health];
  const text = trustLabel ?? badge.defaultShort;
  const shimmer = health === 'pending' && !reduceMotion;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] leading-normal ${badge.className}`}
      aria-label={health === 'pending' && trustLabel ? trustLabel : badge.label}
    >
      {shimmer ? (
        <span className="bg-gradient-to-r from-origin-ink via-origin-ink-subdued to-origin-ink bg-[length:200%_100%] bg-clip-text text-transparent animate-text-shimmer">
          {text}
        </span>
      ) : (
        text
      )}
    </span>
  );
}
