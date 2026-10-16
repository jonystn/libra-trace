import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ReasoningTraceProps, TraceState } from '../../types/trace';
import { ActiveState } from './ActiveState';
import { WaitingState } from './WaitingState';
import { DoneState } from './DoneState';

export type {
  TraceState,
  ReasoningTraceProps,
  SourceDocument,
  SourceDocumentStatus,
  SourceTrustKind,
  DemoScenarioId,
} from '../../types/trace';

export function ReasoningTrace({
  state,
  active,
  waiting,
  done,
  reduceMotion,
  calmMotion,
  onGrantAccess,
  onDismissSource,
  onOpenCitationAudit,
}: ReasoningTraceProps) {
  const [shown, setShown] = useState<TraceState>(state);
  const [collapsing, setCollapsing] = useState(false);
  const handoff = useRef(false);

  const showDone = useCallback(() => {
    setCollapsing(false);
    setShown('done');
  }, []);

  useEffect(() => {
    if (state === 'done' && shown === 'active' && !reduceMotion) {
      handoff.current = true;
      setCollapsing(true);
      return;
    }
    handoff.current = false;
    setCollapsing(false);
    setShown(state);
  }, [state, shown, reduceMotion]);

  return (
    <div
      className={`relative z-10 w-full bg-origin-surface border-[0.5px] border-origin-line rounded-origin-lg ${
        shown === 'waiting' ? 'overflow-hidden' : 'overflow-visible'
      }`}
      aria-busy={shown === 'active'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {shown === 'active' && (
          <ActiveState
            key="active"
            phase={active.phase}
            message={active.message}
            sources={active.sources}
            reduceMotion={reduceMotion}
            calmMotion={calmMotion}
            collapsing={collapsing}
            onCollapsed={showDone}
            onOpenCitationAudit={onOpenCitationAudit}
          />
        )}
        {shown === 'waiting' && (
          <WaitingState
            key="waiting"
            documentName={waiting.documentName}
            reason={waiting.reason}
            onAuthorize={onGrantAccess}
            onDismiss={onDismissSource}
            reduceMotion={reduceMotion}
            inActions
          />
        )}
        {shown === 'done' && (
          <DoneState
            key="done"
            summary={done}
            sources={active.sources}
            reduceMotion={reduceMotion}
            instant={handoff.current}
            onOpenCitationAudit={onOpenCitationAudit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
