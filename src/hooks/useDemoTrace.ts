import { useCallback, useEffect, useRef, useState } from 'react';
import { withCitations } from '../data/citationMeta';
import { DEFAULT_SCENARIO, MOCK_SCENARIOS } from '../data/mockScenarios';
import type {
  ActiveTraceData,
  DemoScenarioId,
  DoneSummary,
  TraceState,
  WaitingBlock,
} from '../types/trace';

function cloneActive(data: ActiveTraceData): ActiveTraceData {
  return {
    phase: data.phase ?? 'searching',
    message: data.message,
    sources: withCitations(data.sources.map((source) => ({ ...source }))),
  };
}

export function useDemoTrace() {
  const [traceState, setTraceState] = useState<TraceState>('active');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [runningScenario, setRunningScenario] = useState<DemoScenarioId | null>(null);
  const [calmMotion, setCalmMotion] = useState(false);

  const [active, setActive] = useState<ActiveTraceData>(() => cloneActive(DEFAULT_SCENARIO.active));
  const [waiting, setWaiting] = useState<WaitingBlock>(DEFAULT_SCENARIO.waiting);
  const [done, setDone] = useState<DoneSummary>(DEFAULT_SCENARIO.done);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delayMs: number) => {
    const id = setTimeout(fn, delayMs);
    timersRef.current.push(id);
  }, []);

  const applyScenarioData = useCallback((id: DemoScenarioId) => {
    const scenario = MOCK_SCENARIOS[id];
    setActive(cloneActive(scenario.active));
    setWaiting(scenario.waiting);
    setDone(scenario.done);
    setCalmMotion(id === 'dense');
  }, []);

  const runScenario = useCallback(
    (id: DemoScenarioId) => {
      clearTimers();
      setRunningScenario(id);
      applyScenarioData(id);
      setTraceState('active');

      const scenario = MOCK_SCENARIOS[id];

      if (scenario.activePhaseTimeline?.length) {
        const initialPhase = scenario.activePhaseTimeline[0].phase;
        setActive((prev) => ({
          ...prev,
          phase: initialPhase,
          sources: initialPhase === 'searching' ? cloneActive(scenario.active).sources : [],
        }));
      }

      scenario.activePhaseTimeline?.forEach((frame) => {
        schedule(() => {
          setActive((prev) => {
            if (frame.phase === 'searching') {
              return {
                ...prev,
                phase: 'searching',
                sources: cloneActive(scenario.active).sources,
              };
            }
            return { ...prev, phase: frame.phase, sources: [] };
          });
        }, frame.atMs);
      });

      scenario.sourceTimeline?.forEach((frame) => {
        schedule(() => {
          setActive((prev) => {
            if (prev.phase !== 'searching') return prev;
            return {
              ...prev,
              sources: withCitations(frame.sources.map((s) => ({ ...s }))),
            };
          });
        }, frame.atMs);
      });

      scenario.stateTimeline?.forEach((frame) => {
        schedule(() => setTraceState(frame.state), frame.atMs);
      });

      if (scenario.completeAtMs != null) {
        schedule(() => {
          const finalSources = scenario.sourceTimeline?.[scenario.sourceTimeline.length - 1]?.sources;
          if (finalSources) {
            setActive((prev) => ({
              ...prev,
              sources: withCitations(finalSources.map((source) => ({ ...source }))),
            }));
          }
          setTraceState('done');
          setRunningScenario(null);
        }, scenario.completeAtMs);
      }
    },
    [applyScenarioData, clearTimers, schedule],
  );

  const setManualState = useCallback(
    (state: TraceState) => {
      clearTimers();
      setRunningScenario(null);
      setCalmMotion(false);
      if (state === 'active') {
        setActive((prev) => ({ ...prev, phase: 'searching' }));
      }
      setTraceState(state);
    },
    [clearTimers],
  );

  const onGrantAccess = useCallback(() => {
    clearTimers();
    setRunningScenario(null);
    setTraceState('active');
  }, [clearTimers]);

  const onDismissSource = useCallback(() => {
    clearTimers();
    setRunningScenario(null);
    setTraceState('done');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    traceState,
    active,
    waiting,
    done,
    reduceMotion,
    setReduceMotion,
    calmMotion,
    runningScenario,
    runScenario,
    setManualState,
    onGrantAccess,
    onDismissSource,
  };
}
