import { OriginButton } from '../ui/OriginButton';
import { OpenSourceIcon, SourceFileIcon, SourceLockIcon, WoltersKluwerCorpusIcon } from './TraceIcons';

export interface CitationPopoverProps {
  /** Corpus bucket, e.g. "Statutes & Case Law". */
  collection: string;
  title: string;
  excerpt: string;
  leading?: 'corpus' | 'file' | 'lock';
  onCitationList?: () => void;
  onOpenSource?: () => void;
}

function LeadingMark({ leading }: { leading: CitationPopoverProps['leading'] }) {
  if (leading === 'lock') return <SourceLockIcon className="size-3.5 text-origin-ink-subdued" />;
  if (leading === 'file') return <SourceFileIcon className="size-3.5 text-origin-ink-subdued" />;
  return <WoltersKluwerCorpusIcon />;
}

/** Citation card shared by source pills and, later, inline citations in the answer. */
export function CitationPopover({
  collection,
  title,
  excerpt,
  leading = 'corpus',
  onCitationList,
  onOpenSource,
}: CitationPopoverProps) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-origin-line bg-origin-surface text-left shadow-origin-md">
      <div className="flex items-center gap-2 border-b border-origin-line bg-origin-subdued px-3 py-2.5">
        <LeadingMark leading={leading} />
        <p className="text-sm text-origin-ink">{collection}</p>
      </div>

      <div className="flex flex-col gap-2 px-3 py-3">
        <p className="text-sm font-semibold leading-snug text-origin-ink">{title}</p>
        <p className="line-clamp-4 text-xs leading-relaxed text-origin-ink-subdued">{excerpt}</p>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-origin-line bg-origin-subdued px-3 py-2.5">
        <OriginButton variant="secondary" onClick={onCitationList}>
          Citation list
        </OriginButton>
        <OriginButton variant="primary" onClick={onOpenSource}>
          To source
          <OpenSourceIcon className="size-3.5" />
        </OriginButton>
      </div>
    </div>
  );
}
