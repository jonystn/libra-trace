import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { SourceDocument } from '../../types/trace';
import { CitationPopover } from './CitationPopover';
import { CitationTrustBadge } from './CitationTrustBadge';
import { isInternalCorpusSource } from '../../data/citationMeta';
import { SourceAlertIcon, SourceFileIcon, SourceLockIcon, WoltersKluwerCorpusIcon } from './TraceIcons';
import { popoverTransition } from './motion';

interface SourcePillProps {
  document: SourceDocument;
  reduceMotion?: boolean;
  /** Prefer `above` in stacked audit steps so the popover does not cover the next row. */
  popoverPlacement?: 'above' | 'below';
  /** When false (e.g. audit accordion closing), popover is dismissed immediately. */
  hostExpanded?: boolean;
  onOpenAudit?: (document: SourceDocument) => void;
}

const POPOVER_WIDTH = 352;

const PILL_SHELL =
  'inline-flex items-center gap-1.5 rounded-[8px] border border-origin-line bg-origin-surface p-1 font-[inherit] text-xs';

function PillLeadingIcon({ doc }: { doc: SourceDocument }) {
  const iconClass = 'size-3.5 text-origin-ink-subdued';
  if (doc.status === 'unauthorized' || doc.citation?.health === 'restricted') {
    return <SourceLockIcon className={iconClass} />;
  }
  if (isInternalCorpusSource(doc.name, doc.citation)) {
    return <WoltersKluwerCorpusIcon />;
  }
  if (doc.citation?.health === 'superseded') {
    return <SourceAlertIcon className={iconClass} />;
  }
  return <SourceFileIcon className={iconClass} />;
}

type PopoverCoords = { left: number; top?: number; bottom?: number };

function popoverActions(root: HTMLElement | null) {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
}

function nextFieldAfter(anchor: HTMLElement | null, popover: HTMLElement | null) {
  if (!anchor) return null;
  const all = [
    ...document.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => {
    if (popover?.contains(el)) return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
  const index = all.indexOf(anchor);
  return index >= 0 ? (all[index + 1] ?? null) : null;
}

export function SourcePill({
  document: doc,
  reduceMotion,
  popoverPlacement = 'above',
  hostExpanded = true,
  onOpenAudit,
}: SourcePillProps) {
  const popoverId = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const skipOpenOnFocus = useRef(false);
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const isIndexing = doc.status === 'indexing';
  const isInteractive = Boolean(doc.citation) && !isIndexing;

  const updateCoords = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - POPOVER_WIDTH - 8);
    const left = Math.min(Math.max(8, rect.left), maxLeft);
    if (popoverPlacement === 'above') {
      setCoords({ left, bottom: window.innerHeight - rect.top });
      return;
    }
    setCoords({ left, top: rect.bottom });
  }, [popoverPlacement]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [open, updateCoords]);

  const cancelClose = () => {
    if (closeTimer.current == null) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      const active = document.activeElement;
      if (active === buttonRef.current || popoverRef.current?.contains(active)) return;
      setOpen(false);
    }, 80);
  };

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!hostExpanded) {
      cancelClose();
      setOpen(false);
    }
  }, [hostExpanded]);

  const canShowPopover = open && hostExpanded;

  const focusFirstAction = () => {
    setOpen(true);
    const tryFocus = (left: number) => {
      const action = popoverRef.current?.querySelector<HTMLButtonElement>('button');
      if (action) {
        action.focus();
        return;
      }
      if (left > 0) requestAnimationFrame(() => tryFocus(left - 1));
    };
    requestAnimationFrame(() => tryFocus(4));
  };

  const onPillKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!hostExpanded) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      focusFirstAction();
      return;
    }
    if (event.key === 'Tab' && !event.shiftKey && open) {
      const action = popoverActions(popoverRef.current)[0];
      if (!action) return;
      event.preventDefault();
      action.focus();
    }
  };

  const onPopoverKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions = popoverActions(popoverRef.current);
    const index = actions.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key !== 'Tab' || index < 0) return;
    if (!event.shiftKey && index === actions.length - 1) {
      event.preventDefault();
      const next = nextFieldAfter(buttonRef.current, popoverRef.current);
      setOpen(false);
      if (next) {
        next.focus();
        return;
      }
      skipOpenOnFocus.current = true;
      buttonRef.current?.focus();
      return;
    }
    if (event.shiftKey && index === 0) {
      event.preventDefault();
      buttonRef.current?.focus();
    }
  };

  const pillBody = (
    <>
      <PillLeadingIcon doc={doc} />
      <span
        className="max-w-[120px] shrink truncate text-xs font-medium leading-normal text-origin-ink"
        title={isInteractive ? undefined : doc.name}
      >
        {doc.name}
      </span>
      {isIndexing && (
        <CitationTrustBadge health="pending" trustLabel="Reading..." reduceMotion={reduceMotion} />
      )}
      {doc.citation && !isIndexing && doc.citation.health !== 'superseded' && (
        <CitationTrustBadge
          health={doc.citation.health}
          trustLabel={doc.citation.trustLabel}
          reduceMotion={reduceMotion}
        />
      )}
    </>
  );

  const shellClass = PILL_SHELL;

  if (!isInteractive) {
    return <span className={shellClass}>{pillBody}</span>;
  }

  const citation = doc.citation!;
  const opensUp = popoverPlacement === 'above';

  const popover = createPortal(
    <AnimatePresence initial={false}>
      {canShowPopover && coords && (
        <motion.div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-label={doc.name}
          onKeyDown={onPopoverKeyDown}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (popoverRef.current?.contains(next) || buttonRef.current === next) return;
            setOpen(false);
          }}
          initial={reduceMotion ? false : { opacity: 0, y: opensUp ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: opensUp ? 4 : -4 }}
          transition={popoverTransition(reduceMotion)}
          className="fixed z-[1000] w-[22rem] max-w-[min(22rem,calc(100vw-2rem))]"
          style={{ left: coords.left, top: coords.top, bottom: coords.bottom }}
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <div className={popoverPlacement === 'above' ? 'pb-2' : 'pt-2'}>
            <CitationPopover
              collection={citation.collection ?? 'Statutes & Case Law'}
              title={citation.title ?? doc.name}
              excerpt={citation.excerpt}
              leading={
                doc.status === 'unauthorized' || citation.health === 'restricted'
                  ? 'lock'
                  : isInternalCorpusSource(doc.name, citation)
                    ? 'corpus'
                    : 'file'
              }
              onCitationList={() => onOpenAudit?.(doc)}
              onOpenSource={() => onOpenAudit?.(doc)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <>
      <span
        ref={anchorRef}
        className={`relative inline-flex ${open ? 'z-50' : ''}`}
        onMouseEnter={() => {
          if (!hostExpanded) return;
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        <button
          ref={buttonRef}
          type="button"
          className={`${shellClass} transition hover:border-[color:var(--origin-color-border-base-default)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-origin-ink focus-visible:ring-offset-1`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={popoverId}
          onKeyDown={onPillKeyDown}
          onFocus={() => {
            if (skipOpenOnFocus.current) {
              skipOpenOnFocus.current = false;
              return;
            }
            if (hostExpanded) setOpen(true);
          }}
          onBlur={(event) => {
            const next = event.relatedTarget as Node | null;
            if (event.currentTarget.parentElement?.contains(next) || popoverRef.current?.contains(next)) return;
            setOpen(false);
          }}
        >
          {pillBody}
        </button>
      </span>
      {popover}
    </>
  );
}
