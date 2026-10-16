import { OriginButton } from '../ui/OriginButton';

interface SourceOverflowPillProps {
  hiddenCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export function SourceOverflowPill({ hiddenCount, expanded, onToggle }: SourceOverflowPillProps) {
  const label = expanded
    ? 'Show fewer sources'
    : `+${hiddenCount} additional source${hiddenCount === 1 ? '' : 's'}…`;

  return (
    <OriginButton variant="secondary" pressed={expanded} onClick={onToggle} aria-expanded={expanded}>
      {label}
    </OriginButton>
  );
}
