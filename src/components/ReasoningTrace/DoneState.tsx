import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { DoneSummary, SourceDocument } from '../../types/trace';
import { sourcesWithBadges, withCitations } from '../../data/citationMeta';
import { useMeasuredHeight } from '../../hooks/useMeasuredHeight';
import { SourcePill } from './SourcePill';
import { CheckCircleIcon, ChevronIcon } from './TraceIcons';
import { accordionTransition, microTransition, skipInitial, traceTransition } from './motion';

interface DoneStateProps {
  summary: DoneSummary;
  sources?: SourceDocument[];
  reduceMotion?: boolean;
  initialAuditOpen?: boolean;
  /** Skip the fade-in when the active trace has already folded into this bar. */
  instant?: boolean;
  onOpenCitationAudit?: (document: SourceDocument) => void;
}

function thoughtLabel(seconds: number) {
  const unit = seconds === 1 ? 'second' : 'seconds';
  return `Thought for ${seconds} ${unit}`;
}

function sourcesForStep(step: DoneSummary['auditSteps'][number], allSources: SourceDocument[]) {
  if (!step.consultedSourceIds?.length) return [];
  const ids = new Set(step.consultedSourceIds);
  return sourcesWithBadges(
    withCitations(
      allSources
        .filter((doc) => ids.has(doc.id))
        .map((doc) => (doc.status === 'indexing' ? { ...doc, status: 'verified' as const, citation: undefined } : doc)),
    ),
  );
}

export function DoneState({
  summary,
  sources = [],
  reduceMotion,
  initialAuditOpen = false,
  instant = false,
  onOpenCitationAudit,
}: DoneStateProps) {
  const [isOpen, setIsOpen] = useState(initialAuditOpen);
  const { ref: innerRef, height: contentHeight } = useMeasuredHeight<HTMLDivElement>([
    summary.auditSteps,
    sources,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const panelTransition = accordionTransition(reduceMotion);

  return (
    <motion.div
      initial={instant ? false : skipInitial(reduceMotion, { opacity: 0 })}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={traceTransition({ reduceMotion })}
      className="flex w-full flex-col px-4"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="insight-steps"
        className="group/tray flex w-full items-center justify-between py-3 text-left focus-visible:outline-none"
      >
        <span className="text-sm text-origin-ink-subdued">{thoughtLabel(summary.durationSeconds)}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-origin-sm text-origin-ink-subdued group-hover/tray:bg-origin-subdued">
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={microTransition(reduceMotion)}
            className="inline-flex"
            aria-hidden
          >
            <ChevronIcon />
          </motion.span>
        </span>
      </button>

      <motion.div
        id="insight-steps"
        initial={false}
        animate={{ height: isOpen ? contentHeight : 0 }}
        transition={panelTransition}
        className="overflow-hidden"
      >
        <div ref={innerRef} className="flex flex-col gap-4 border-t-[0.5px] border-origin-line py-3">
          {summary.auditSteps.map((step, index) => {
            const stepSources = step.kind === 'search' ? sourcesForStep(step, sources) : [];
            return (
              <div
                key={step.id}
                className="insight-step flex w-full flex-col gap-2"
                style={{ animationDelay: reduceMotion ? '0ms' : `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="size-4 shrink-0 text-origin-ink" />
                  <span className="text-sm font-medium text-origin-ink">{step.label}</span>
                </div>
                {stepSources.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-7">
                    {stepSources.map((doc) => (
                      <SourcePill
                        key={`${step.id}-${doc.id}`}
                        document={doc}
                        reduceMotion={reduceMotion}
                        hostExpanded={isOpen}
                        onOpenAudit={onOpenCitationAudit}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
