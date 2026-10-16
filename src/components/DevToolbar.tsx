import type { ReactNode } from 'react';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { BlockedScenarioIcon, DenseScenarioIcon, QuickScenarioIcon } from './ReasoningTrace/TraceIcons';
import { OriginButton } from './ui/OriginButton';
import type { DemoScenarioId, TraceState } from '../types/trace';

export type AppView = 'chat' | 'atoms';

interface DevToolbarProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  traceState: TraceState;
  runningScenario: DemoScenarioId | null;
  reduceMotion: boolean;
  onRunScenario: (id: DemoScenarioId) => void;
  onManualState: (state: TraceState) => void;
  onReduceMotionChange: (value: boolean) => void;
}

const MANUAL_STATES: TraceState[] = ['active', 'waiting', 'done'];

const SCENARIO_ICON: Record<DemoScenarioId, typeof QuickScenarioIcon> = {
  quick: QuickScenarioIcon,
  dense: DenseScenarioIcon,
  blocked: BlockedScenarioIcon,
};

export function DevToolbar({
  view,
  onViewChange,
  traceState,
  runningScenario,
  reduceMotion,
  onRunScenario,
  onManualState,
  onReduceMotionChange,
}: DevToolbarProps) {
  const scenarioIds = Object.keys(MOCK_SCENARIOS) as DemoScenarioId[];

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 rounded-origin-lg border border-origin-line bg-origin-surface p-3 shadow-origin-md">
      <div className="flex flex-col gap-2.5">
        <ToolbarRow label="View">
          <OriginButton variant={view === 'chat' ? 'primary' : 'secondary'} pressed={view === 'chat'} onClick={() => onViewChange('chat')}>
            Chat demo
          </OriginButton>
          <OriginButton variant={view === 'atoms' ? 'primary' : 'secondary'} pressed={view === 'atoms'} onClick={() => onViewChange('atoms')}>
            Atom gallery
          </OriginButton>
          <label className="ml-auto inline-flex items-center gap-1.5 text-xs text-origin-ink-subdued cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => onReduceMotionChange(e.target.checked)}
              className="rounded-origin-sm border-origin-line text-origin-ink focus-visible:ring-2 focus-visible:ring-origin-ink"
            />
            Reduced motion
          </label>
        </ToolbarRow>

        {view === 'chat' && (
          <>
            <ToolbarRow label="Demo">
              {scenarioIds.map((id) => {
                const scenario = MOCK_SCENARIOS[id];
                const isRunning = runningScenario === id;
                const ScenarioIcon = SCENARIO_ICON[id];
                return (
                  <OriginButton
                    key={id}
                    variant={isRunning ? 'primary' : 'secondary'}
                    pressed={isRunning}
                    onClick={() => onRunScenario(id)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <ScenarioIcon />
                      {scenario.label}
                    </span>
                  </OriginButton>
                );
              })}
            </ToolbarRow>

            <ToolbarRow label="State">
              {MANUAL_STATES.map((s) => (
                <OriginButton
                  key={s}
                  variant={traceState === s && !runningScenario ? 'primary' : 'secondary'}
                  pressed={traceState === s && !runningScenario}
                  onClick={() => onManualState(s)}
                  className="capitalize"
                >
                  {s}
                </OriginButton>
              ))}
            </ToolbarRow>
          </>
        )}
      </div>
    </div>
  );
}

function ToolbarRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-11 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-origin-ink-subdued">
        {label}
      </span>
      {children}
    </div>
  );
}
