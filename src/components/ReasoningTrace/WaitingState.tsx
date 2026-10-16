import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { WaitingBlock } from '../../types/trace';
import { useMeasuredHeight } from '../../hooks/useMeasuredHeight';
import { OriginButton } from '../ui/OriginButton';
import { ChevronIcon } from './TraceIcons';
import { accordionTransition, microTransition, scaleEnter, skipInitial, traceTransition } from './motion';

interface WaitingStateProps extends WaitingBlock {
  onAuthorize?: () => void;
  onDismiss?: () => void;
  reduceMotion?: boolean;
  /** Sit under the Actions header instead of filling the card alone. */
  inActions?: boolean;
}

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded border border-[color:var(--origin-color-border-base-default)] p-1 font-[inherit] text-[10px] font-medium leading-none text-origin-ink">
      {children}
    </kbd>
  );
}

function WaitingBody({
  documentName,
  reason,
  onAuthorize,
  onDismiss,
  inset,
}: WaitingBlock & {
  onAuthorize?: () => void;
  onDismiss?: () => void;
  inset: boolean;
}) {
  return (
    <div className={`relative flex flex-col gap-3 ${inset ? 'pt-3' : ''}`}>
      <h4 id="trace-waiting-title" className="pr-32 text-sm font-medium text-origin-ink">
        Restricted access
      </h4>

      <div className="flex flex-col gap-1 text-xs leading-normal">
        <p className="text-origin-ink-subdued">{reason}</p>
        <p className="font-medium text-origin-ink">{documentName}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div id="trace-waiting-shortcuts" className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Kbd>Enter</Kbd>
            <span className="text-[10px] leading-normal text-origin-ink-subdued">to authorize</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span className="text-[10px] leading-normal text-origin-ink-subdued">to ignore</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OriginButton
            variant="primary"
            className="!px-4"
            data-waiting-action="authorize"
            onClick={onAuthorize}
          >
            Authorize access
          </OriginButton>
          <OriginButton
            variant="secondary"
            className="!px-4"
            data-waiting-action="dismiss"
            onClick={onDismiss}
          >
            Ignore document
          </OriginButton>
        </div>
      </div>

      <span
        className={`absolute rounded-full bg-origin-critical-fill px-2 py-1 text-xs font-medium leading-normal text-origin-critical ${
          inset ? 'right-0 top-3' : 'right-4 top-4'
        }`}
      >
        Action required
      </span>
    </div>
  );
}

export function WaitingState({
  documentName,
  reason,
  onAuthorize,
  onDismiss,
  reduceMotion,
  inActions = false,
}: WaitingStateProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [actionsOpen, setActionsOpen] = useState(true);
  const { ref: bodyRef, height: actionsHeight } = useMeasuredHeight<HTMLDivElement>([
    inActions,
    documentName,
    reason,
  ]);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  const panelTransition = accordionTransition(reduceMotion);

  const body = (
    <WaitingBody
      documentName={documentName}
      reason={reason}
      onAuthorize={onAuthorize}
      onDismiss={onDismiss}
      inset={inActions}
    />
  );

  return (
    <motion.div
      ref={panelRef}
      role="region"
      aria-labelledby="trace-waiting-title"
      aria-describedby="trace-waiting-shortcuts"
      tabIndex={0}
      initial={skipInitial(reduceMotion, {
        opacity: 0,
        scale: scaleEnter(reduceMotion),
      })}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: scaleEnter(reduceMotion) }}
      transition={traceTransition({ reduceMotion })}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-origin-ink focus-visible:ring-offset-2 ${
        inActions ? 'px-4 py-3' : 'px-4 py-4'
      }`}
    >
      {inActions ? (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setActionsOpen((open) => !open)}
            aria-expanded={actionsOpen}
            className={`motion-header group/actions flex w-full items-center justify-between border-b-[0.5px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-origin-ink focus-visible:ring-offset-2 rounded-origin-sm ${
              actionsOpen ? 'border-origin-line pb-3' : 'border-transparent pb-0'
            }`}
          >
            <span className="text-sm text-origin-ink-subdued">Actions</span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-origin-sm text-origin-ink-subdued group-hover/actions:bg-origin-subdued">
              <motion.span
                animate={{ rotate: actionsOpen ? 180 : 0 }}
                transition={microTransition(reduceMotion)}
                className="inline-flex"
                aria-hidden
              >
                <ChevronIcon />
              </motion.span>
            </span>
          </button>

          <motion.div
            initial={false}
            animate={{ height: actionsOpen ? actionsHeight : 0 }}
            transition={panelTransition}
            className="overflow-hidden"
          >
            <div ref={bodyRef}>
              {body}
            </div>
          </motion.div>
        </div>
      ) : (
        body
      )}
    </motion.div>
  );
}
