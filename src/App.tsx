import { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ReasoningTrace } from './components/ReasoningTrace';
import { DevToolbar, type AppView } from './components/DevToolbar';
import { useDemoTrace } from './hooks/useDemoTrace';
import { useMotionPreference } from './hooks/useMotionPreference';
import { useWaitingKeyboardShortcuts } from './hooks/useWaitingKeyboardShortcuts';
import { TrustAtomsShowcase } from './showcase/TrustAtomsShowcase';
import type { SourceDocument } from './types/trace';

export default function App() {
  const [view, setView] = useState<AppView>('chat');
  const [auditNotice, setAuditNotice] = useState<string | null>(null);
  const {
    traceState,
    active,
    waiting,
    done,
    reduceMotion: forceReducedMotion,
    setReduceMotion,
    calmMotion,
    runningScenario,
    runScenario,
    setManualState,
    onGrantAccess,
    onDismissSource,
  } = useDemoTrace();

  const reduceMotion = useMotionPreference(forceReducedMotion);

  useWaitingKeyboardShortcuts(view === 'chat' && traceState === 'waiting', {
    onAuthorize: onGrantAccess,
    onDismiss: onDismissSource,
  });

  const handleOpenCitationAudit = (document: SourceDocument) => {
    const registry = document.citation?.registryLabel ?? 'Official registry';
    setAuditNotice(`To source · ${document.name} — ${registry}`);
    window.setTimeout(() => setAuditNotice(null), 3200);
  };

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <div
        className={`min-h-screen bg-white text-[var(--origin-color-text-base-default)] flex flex-col items-center p-6 ${reduceMotion ? 'reduce-motion' : ''}`}
      >
        <DevToolbar
          view={view}
          onViewChange={setView}
          traceState={traceState}
          runningScenario={runningScenario}
          reduceMotion={forceReducedMotion}
          onRunScenario={runScenario}
          onManualState={setManualState}
          onReduceMotionChange={setReduceMotion}
        />

        <main className="w-full max-w-3xl mt-44 flex flex-col items-center">
          {view === 'atoms' ? (
            <TrustAtomsShowcase
              reduceMotion={reduceMotion}
              onOpenCitationAudit={handleOpenCitationAudit}
            />
          ) : (
            <div className="w-full max-w-2xl space-y-6">
              <div className="ml-auto max-w-md rounded-2xl bg-origin-subdued px-4 py-3 text-sm leading-relaxed text-origin-ink">
                What are the grounds for extra-contractual liability in this matter under the German Civil Code
                (BGB)?
              </div>

              <div className="space-y-3">
                <p className="text-xs text-origin-ink-subdued">Libra AI</p>
                <ReasoningTrace
                  state={traceState}
                  active={active}
                  waiting={waiting}
                  done={done}
                  reduceMotion={reduceMotion}
                  calmMotion={calmMotion}
                  onGrantAccess={onGrantAccess}
                  onDismissSource={onDismissSource}
                  onOpenCitationAudit={handleOpenCitationAudit}
                />

                {traceState === 'done' && (
                  <article className="space-y-6 pt-4 text-[15px] leading-relaxed text-origin-ink">
                    <section className="space-y-2">
                      <h2 className="text-base font-semibold">Clarification and legal framework</h2>
                      <p>
                        I do not have the facts or documents for the specific “matter” in your question. I will
                        therefore identify the principal{' '}
                        <strong className="font-semibold">
                          extra-contractual liability grounds under the German Civil Code (BGB)
                        </strong>
                        , while noting that the applicable ground depends on the conduct, protected interest,
                        causation, fault, and any statutory defences.
                      </p>
                    </section>
                    <section className="space-y-2">
                      <h2 className="text-base font-semibold">Additional statutory checks</h2>
                      <p>
                        The retrieved provisions confirm the core{' '}
                        <strong className="font-semibold">§§ 823 and 826 BGB</strong> claims, but a complete
                        answer also requires the BGB rules on{' '}
                        <strong className="font-semibold">
                          vicarious liability, official liability, joint liability, contributory negligence, and
                          the scope of damages
                        </strong>
                        . I am checking those provisions before applying the framework.
                      </p>
                    </section>
                  </article>
                )}
              </div>
            </div>
          )}
        </main>

        {auditNotice && (
          <div
            role="status"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md px-4 py-2.5 rounded-origin bg-origin-inverse text-origin-inverse-ink text-xs shadow-origin-md z-50"
          >
            {auditNotice}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
