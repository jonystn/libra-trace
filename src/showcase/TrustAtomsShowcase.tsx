import { useEffect, useState, type ReactNode } from 'react';
import { withCitations } from '../data/citationMeta';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { CitationPopover } from '../components/ReasoningTrace/CitationPopover';
import { CitationTrustBadge } from '../components/ReasoningTrace/CitationTrustBadge';
import { DoneState } from '../components/ReasoningTrace/DoneState';
import { WaitingState } from '../components/ReasoningTrace/WaitingState';
import { SourceOverflowPill } from '../components/ReasoningTrace/SourceOverflowPill';
import { SourcePill } from '../components/ReasoningTrace/SourcePill';
import { ThinkingSpinnerIcon } from '../components/ReasoningTrace/TraceIcons';
import type { SpinCycle } from '../motion/spinCycle';
import { motion } from '../motion/tokens';
import type { SourceDocument, SourceTrustKind } from '../types/trace';

const SPIN_TOKENS: Array<{ cycle: SpinCycle; token: string; meaning: string }> = [
  { cycle: 'deep', token: 'spin.deep', meaning: `Heavy reasoning · ${motion.spin.deep}s / rev` },
  { cycle: 'moderate', token: 'spin.moderate', meaning: `Steady read · ${motion.spin.moderate}s / rev` },
  { cycle: 'intense', token: 'spin.intense', meaning: `Quick scan · ${motion.spin.intense}s / rev` },
];

const RHYTHM_CYCLES: SpinCycle[] = ['intense', 'moderate', 'deep'];

function CycleRhythmDemo({ reduceMotion }: { reduceMotion?: boolean }) {
  const [cycle, setCycle] = useState<SpinCycle>('intense');

  useEffect(() => {
    const id = window.setInterval(() => {
      setCycle((current) => {
        const index = RHYTHM_CYCLES.indexOf(current);
        return RHYTHM_CYCLES[(index + 1) % RHYTHM_CYCLES.length];
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-origin-sm border border-dashed border-origin-line px-3 py-2">
      <ThinkingSpinnerIcon
        className="size-4 shrink-0 text-origin-ink-subdued"
        cycle={cycle}
        reduceMotion={reduceMotion}
      />
      <div>
        <p className="text-xs font-medium text-origin-ink">spin.{cycle}</p>
        <p className="text-[11px] text-origin-ink-subdued">
          Fast attack into a file, slow release into heavier thought
        </p>
      </div>
    </div>
  );
}

const SAMPLE_DOCS: SourceDocument[] = withCitations([
  { id: 's1', name: 'BGB § 823.pdf', status: 'verified' },
  { id: 's3', name: 'Minuta_Contract_Confidential.pdf', status: 'unauthorized' },
  { id: 's4', name: 'EU_Directive_85_374.pdf', status: 'indexing' },
]);

const TRUST_KINDS: SourceTrustKind[] = ['in_force', 'restricted', 'pending'];

const SAMPLE_DONE = MOCK_SCENARIOS.quick.done;
const SAMPLE_DONE_SOURCES = withCitations(MOCK_SCENARIOS.quick.active.sources);
const SAMPLE_WAITING = MOCK_SCENARIOS.blocked.waiting;

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-origin-lg border border-origin-line bg-origin-surface p-5 shadow-origin space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-origin-ink">{title}</h2>
        <p className="text-xs text-origin-ink-subdued mt-0.5">{description}</p>
      </div>
      {children}
    </section>
  );
}

function GroupHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wider text-origin-ink-subdued pt-2">{children}</h2>
  );
}

interface TrustAtomsShowcaseProps {
  reduceMotion?: boolean;
  onOpenCitationAudit?: (document: SourceDocument) => void;
}

export function TrustAtomsShowcase({ reduceMotion, onOpenCitationAudit }: TrustAtomsShowcaseProps) {
  const [overflowExpanded, setOverflowExpanded] = useState(false);
  const [inForce, restricted, indexing] = SAMPLE_DOCS;

  return (
    <div className="w-full max-w-3xl space-y-4 pb-12">
      <header className="rounded-origin-lg border border-dashed border-origin-line bg-origin-surface/80 px-4 py-3">
        <h1 className="text-base font-semibold text-origin-ink">Atom gallery — Reasoning Trace</h1>
        <p className="text-xs text-origin-ink-subdued mt-1">
          Atoms (pills, badges) and state molecules (waiting card, done audit bar) used in the Libra trace.
        </p>
      </header>

      <GroupHeading>State molecules</GroupHeading>

      <Section
        title="WaitingState"
        description="Permission gate. Enter authorizes, Esc ignores."
      >
        <WaitingState
          documentName={SAMPLE_WAITING.documentName}
          reason={SAMPLE_WAITING.reason}
          reduceMotion={reduceMotion}
          onAuthorize={() => undefined}
          onDismiss={() => undefined}
        />
      </Section>

      <Section title="DoneState (collapsed)" description="Quiet summary bar after reasoning completes.">
        <DoneState summary={SAMPLE_DONE} reduceMotion={reduceMotion} />
      </Section>

      <Section title="DoneState (audit expanded)" description="Legal audit trail opened for review.">
        <DoneState
          summary={SAMPLE_DONE}
          sources={SAMPLE_DONE_SOURCES}
          reduceMotion={reduceMotion}
          initialAuditOpen
          onOpenCitationAudit={onOpenCitationAudit}
        />
      </Section>

      <GroupHeading>Motion tokens</GroupHeading>

      <Section
        title="Cycle tokens"
        description="Each file has an effort. A statute can scan quickly; commentary winds into spin.deep. Attack is fast, release is slow, so tempo means time-to-reason."
      >
        <div className="flex flex-col gap-3">
          {SPIN_TOKENS.map((item) => (
            <div key={item.cycle} className="flex items-center gap-3">
              <ThinkingSpinnerIcon
                className="size-4 shrink-0 text-origin-ink-subdued"
                cycle={item.cycle}
                reduceMotion={reduceMotion}
              />
              <div>
                <p className="text-xs font-medium text-origin-ink">{item.token}</p>
                <p className="text-[11px] text-origin-ink-subdued">{item.meaning}</p>
              </div>
            </div>
          ))}
          <CycleRhythmDemo reduceMotion={reduceMotion} />
        </div>
      </Section>

      <GroupHeading>Source &amp; trust atoms</GroupHeading>

      <Section title="CitationTrustBadge" description="Semantic validity tag only (used inside SourcePill).">
        <div className="flex flex-wrap gap-2">
          {TRUST_KINDS.map((kind) => (
            <CitationTrustBadge
              key={kind}
              health={kind}
              trustLabel={kind === 'in_force' ? 'In force' : undefined}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </Section>

      <Section title="CitationPopover" description="Same citation card for pills and, later, inline citations.">
        <CitationPopover
          collection="Statutes & Case Law"
          title="§ 823 BGB — Schadensersatzpflicht"
          excerpt="Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet."
          onCitationList={() => onOpenCitationAudit?.(inForce)}
          onOpenSource={() => onOpenCitationAudit?.(inForce)}
        />
      </Section>

      <Section title="SourcePill — In force" description="Official repository cross-check; currently valid.">
        <SourcePill document={inForce} reduceMotion={reduceMotion} onOpenAudit={onOpenCitationAudit} />
      </Section>

      <Section title="SourcePill — Restricted" description="Known document without read permission.">
        <SourcePill document={restricted} reduceMotion={reduceMotion} onOpenAudit={onOpenCitationAudit} />
      </Section>

      <Section title="SourcePill — Indexing" description="Pipeline state while registry sync is running.">
        <SourcePill document={indexing} reduceMotion={reduceMotion} onOpenAudit={onOpenCitationAudit} />
      </Section>

      <Section title="SourceOverflowPill" description="Expandable overflow when more than 3 sources are open.">
        <div className="flex flex-wrap items-center gap-2">
          <SourceOverflowPill hiddenCount={5} expanded={false} onToggle={() => undefined} />
          <SourceOverflowPill
            hiddenCount={5}
            expanded={overflowExpanded}
            onToggle={() => setOverflowExpanded((v) => !v)}
          />
        </div>
      </Section>
    </div>
  );
}
