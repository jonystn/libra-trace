import { useEffect, useRef, useState } from 'react';
import { motion, type MotionValue } from 'framer-motion';
import type { ActiveTracePhase, SourceDocument } from '../../types/trace';
import { sourcesWithBadges } from '../../data/citationMeta';
import { useMeasuredHeight } from '../../hooks/useMeasuredHeight';
import { useSmoothedSpin } from '../../hooks/useSmoothedSpin';
import { spinCycleForPhase, type SpinCycle } from '../../motion/spinCycle';
import { SourcePill } from './SourcePill';
import { SourceOverflowPill } from './SourceOverflowPill';
import { CheckCircleIcon, ChevronIcon, ThinkingSpinnerIcon } from './TraceIcons';
import { accordionTransition, microTransition, skipInitial, traceTransition, verticalEnter } from './motion';

const MAX_VISIBLE = 3;

interface ActiveStateProps {
  phase?: ActiveTracePhase;
  message: string;
  sources: SourceDocument[];
  reduceMotion?: boolean;
  calmMotion?: boolean;
  /** Fold the open trace before the done summary takes its place. */
  collapsing?: boolean;
  onCollapsed?: () => void;
  onOpenCitationAudit?: (document: SourceDocument) => void;
}

function ShimmerLine({
  children,
  reduceMotion,
}: {
  children: string;
  reduceMotion?: boolean;
}) {
  return (
    <p
      className={
        reduceMotion
          ? 'font-medium text-origin-ink'
          : 'font-medium bg-gradient-to-r from-origin-ink via-origin-ink-subdued to-origin-ink bg-[length:200%_100%] bg-clip-text text-transparent animate-text-shimmer'
      }
      aria-live="polite"
    >
      {children}
    </p>
  );
}

/** Libra pairs a radial step loader with shimmer on the label for the current action. */
function ActionStepInProgress({
  label,
  cycle,
  rotate,
  reduceMotion,
}: {
  label: string;
  cycle: SpinCycle;
  rotate: MotionValue<number>;
  reduceMotion?: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <ThinkingSpinnerIcon
        className="size-4 shrink-0 text-origin-ink-subdued"
        cycle={cycle}
        rotate={rotate}
        reduceMotion={reduceMotion}
      />
      <ShimmerLine reduceMotion={reduceMotion}>{label}</ShimmerLine>
    </li>
  );
}

export function ActiveState({
  phase = 'searching',
  message,
  sources,
  reduceMotion,
  calmMotion,
  collapsing = false,
  onCollapsed,
  onOpenCitationAudit,
}: ActiveStateProps) {
  const [actionsOpen, setActionsOpen] = useState(true);
  const [showAllSources, setShowAllSources] = useState(false);
  const visibleSources = sourcesWithBadges(sources);
  const readingNow = visibleSources.filter((doc) => doc.status === 'indexing');
  const settledSources = visibleSources.filter((doc) => doc.status !== 'indexing');
  /** Keep the file being read in the visible row so spinner tempo matches a pill. */
  const orderedSources = [...readingNow, ...settledSources];
  const hiddenCount = Math.max(0, orderedSources.length - MAX_VISIBLE);
  const primarySources = orderedSources.slice(0, MAX_VISIBLE);
  const overflowSources = orderedSources.slice(MAX_VISIBLE);

  useEffect(() => {
    if (phase === 'analyzing' || sources.length === 0) setShowAllSources(false);
  }, [phase, sources.length]);

  useEffect(() => {
    if (phase !== 'analyzing' && !collapsing) setActionsOpen(true);
  }, [phase, collapsing]);

  const openRef = useRef(actionsOpen);
  openRef.current = actionsOpen;
  const reportedClose = useRef(false);
  const spinCycle = spinCycleForPhase(phase, { calm: calmMotion, sources: visibleSources });
  const spinRotate = useSmoothedSpin(spinCycle, reduceMotion, phase === 'analyzing');

  useEffect(() => {
    reportedClose.current = false;
    if (!collapsing) return;
    if (!openRef.current) {
      reportedClose.current = true;
      onCollapsed?.();
      return;
    }
    setActionsOpen(false);
  }, [collapsing, onCollapsed]);

  const phaseRank: Record<ActiveTracePhase, number> = {
    analyzing: 0,
    thinking: 1,
    clarifying: 2,
    searching: 3,
  };
  const rank = phaseRank[phase];
  const { ref: actionsRef, height: actionsHeight } = useMeasuredHeight<HTMLDivElement>([
    phase,
    message,
    visibleSources.length,
    showAllSources,
  ]);

  const yEnter = verticalEnter(reduceMotion);
  const drawerTransition = traceTransition({ reduceMotion, calm: calmMotion });
  const showSources = phase === 'searching' && visibleSources.length > 0;
  const panelTransition = accordionTransition(reduceMotion, calmMotion, collapsing);

  const finishCollapse = () => {
    if (!collapsing || actionsOpen || reportedClose.current) return;
    reportedClose.current = true;
    onCollapsed?.();
  };

  return (
    <motion.div
      initial={skipInitial(reduceMotion, { opacity: 0, y: yEnter })}
      animate={{ opacity: 1, y: 0 }}
      exit={collapsing ? { opacity: 1 } : { opacity: 0, y: reduceMotion ? 0 : 4 }}
      transition={collapsing ? { duration: 0 } : drawerTransition}
      className="px-4 py-3"
    >
      {phase === 'analyzing' ? (
        <p className="flex h-6 items-center text-sm text-origin-ink-subdued" aria-live="polite">
          Analyzing…
        </p>
      ) : (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => setActionsOpen((v) => !v)}
            aria-expanded={actionsOpen}
            className={`motion-header group/actions flex w-full items-center justify-between border-b-[0.5px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-origin-ink focus-visible:ring-offset-2 rounded-origin-sm ${
              collapsing ? 'motion-header-settle' : ''
            } ${actionsOpen ? 'border-origin-line pb-3' : 'border-transparent pb-0'}`}
          >
            <span className="text-sm text-origin-ink-subdued">Actions</span>
            <span className="flex size-6 shrink-0 items-center justify-center text-origin-ink-subdued group-hover/actions:bg-origin-subdued rounded-origin-sm">
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
            onUpdate={(latest) => {
              if (typeof latest.height === 'number' && latest.height <= 0.5) finishCollapse();
            }}
            className="overflow-hidden"
          >
            <div ref={actionsRef}>
              <ul className="space-y-2 pt-3 text-sm text-origin-ink">
                <li className="flex items-center gap-2 text-origin-ink-subdued">
                  <CheckCircleIcon className="size-4 text-origin-ink shrink-0" />
                  Analyzed query
                </li>

                {rank >= 2 ? (
                  <li className="flex items-center gap-2 text-origin-ink-subdued">
                    <CheckCircleIcon className="size-4 text-origin-ink shrink-0" />
                    Thinking
                  </li>
                ) : (
                  <ActionStepInProgress
                    label="Thinking"
                    cycle={spinCycle}
                    rotate={spinRotate}
                    reduceMotion={reduceMotion}
                  />
                )}

                {rank >= 3 && (
                  <li className="flex items-center gap-2 text-origin-ink-subdued">
                    <CheckCircleIcon className="size-4 text-origin-ink shrink-0" />
                    Clarifying legal context
                  </li>
                )}

                {rank === 2 && (
                  <ActionStepInProgress
                    label="Clarifying legal context"
                    cycle={spinCycle}
                    rotate={spinRotate}
                    reduceMotion={reduceMotion}
                  />
                )}

                {rank >= 3 && (
                  <li className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ThinkingSpinnerIcon
                        className="size-4 shrink-0 text-origin-ink-subdued"
                        cycle={spinCycle}
                        rotate={spinRotate}
                        reduceMotion={reduceMotion}
                      />
                      <ShimmerLine reduceMotion={reduceMotion}>{message}</ShimmerLine>
                    </div>
                    <p className="pl-6 text-xs leading-relaxed text-origin-ink-subdued">
                      Checking § 823 BGB and the case law on extra-contractual liability, including sources
                      this session cannot open.
                    </p>
                  </li>
                )}
              </ul>
              {showSources && (
                <div className="pb-1 pl-4 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {[...primarySources, ...(showAllSources ? overflowSources : [])].map((doc) => (
                      <SourcePill
                        key={doc.id}
                        document={doc}
                        popoverPlacement="below"
                        hostExpanded={actionsOpen}
                        reduceMotion={reduceMotion}
                        onOpenAudit={onOpenCitationAudit}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <SourceOverflowPill
                        hiddenCount={hiddenCount}
                        expanded={showAllSources}
                        onToggle={() => setShowAllSources((v) => !v)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
