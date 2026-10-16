import type { SourceDocument, SourceTrustKind } from '../types/trace';

type CitationSeed = {
  health: SourceTrustKind;
  title?: string;
  collection?: string;
  excerpt: string;
  lastUpdated?: string;
  registryLabel?: string;
  detail?: string;
  trustLabel?: string;
  /** Defaults to true — most Libra hits come from the WK internal corpus. */
  fromInternalCorpus?: boolean;
};

const CATALOG: Record<string, CitationSeed> = {
  'BGB § 823.pdf': {
    health: 'in_force',
    trustLabel: 'In force',
    title: '§ 823 BGB — Schadensersatzpflicht',
    excerpt:
      'Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet.',
    lastUpdated: '2024',
    registryLabel: 'gesetze-im-internet.de',
    detail: 'Cross-checked against the official federal statute repository.',
  },
  'BGH_Key_Ruling_2022.pdf': {
    health: 'in_force',
    trustLabel: 'Verified',
    title: 'BGH, VI ZR 252/19 — Leading decision on standard of care',
    excerpt: 'BGH, VI ZR 252/19 — Standard of care in traffic negligence (leading principle).',
    lastUpdated: '2022',
    registryLabel: 'juris / BGH',
  },
  'BGH VI ZR 252_19.pdf': {
    health: 'in_force',
    trustLabel: 'Verified',
    title: 'BGH, VI ZR 252/19 — Leading decision on standard of care in tort',
    excerpt: 'BGH, VI ZR 252/19 — Leading decision on standard of care in tort.',
    lastUpdated: '2022',
    registryLabel: 'juris / BGH',
  },
  'OLG_Muenchen_2023.docx': {
    health: 'superseded',
    trustLabel: 'Revised 2023',
    excerpt: 'OLG München — Summary no. 12 (liability scope); later BGH line narrows application.',
    lastUpdated: '2023',
    registryLabel: 'OLG München',
    detail: 'Attention: subsequent legislation and BGH case law modify the cited article’s scope.',
  },
  'Commentary_Schwan_Tort.pdf': {
    health: 'in_force',
    trustLabel: 'Verified',
    title: 'Schwan Commentary § 823',
    excerpt: 'Schwan Commentary § 823 — Annotated elements: unlawfulness, fault, causation, damage.',
    lastUpdated: '2023',
    registryLabel: 'Firm library',
  },
  'Firm_Precedent_Index.xlsx': {
    health: 'in_force',
    trustLabel: 'Verified',
    title: 'Firm precedent index — BGB § 823',
    excerpt: 'Internal index — 142 prior matters tagged BGB § 823 (metadata only).',
    lastUpdated: '2025',
    registryLabel: 'Firm knowledge base',
  },
  'EU_Directive_85_374.pdf': {
    health: 'superseded',
    trustLabel: 'Amended 2020',
    excerpt: 'Council Directive 85/374/EEC — Product liability; national transposition amended post-2020.',
    lastUpdated: '2020',
    registryLabel: 'EUR-Lex',
    detail: 'Norm amended: national implementation updated; verify current § mapping.',
  },
  'Internal_Contract_Draft.pdf': {
    health: 'restricted',
    trustLabel: 'Restricted access',
    excerpt: 'Privileged matter brief — no read key; awaiting authorization.',
    registryLabel: 'Matter vault',
    detail: 'Document located but not readable until client permission is granted.',
  },
  'Minuta_Contract_Confidential.pdf': {
    health: 'restricted',
    trustLabel: 'Restricted access',
    title: 'Minuta — confidential contract draft',
    excerpt: 'Confidential contract draft — decryption key not available to this session.',
    registryLabel: 'Secure attachment',
    detail: 'Included in trace as inaccessible per briefing (“sources it could not access”).',
  },
  'Client_Matter_Brief_CONF.pdf': {
    health: 'restricted',
    trustLabel: 'Restricted access',
    excerpt: 'Client matter brief — read permission required before analysis.',
    registryLabel: 'Matter vault',
    detail: 'Permission pending; triggers waiting state when encountered.',
  },
};

const INTERNAL_CORPUS_NAMES = new Set(Object.keys(CATALOG));

export function isInternalCorpusSource(name: string, citation?: SourceDocument['citation']): boolean {
  if (citation?.fromInternalCorpus === false) return false;
  if (citation?.fromInternalCorpus === true) return true;
  return INTERNAL_CORPUS_NAMES.has(name);
}

function withCorpusFlag(seed: CitationSeed | undefined, fallback: CitationSeed): CitationSeed & { fromInternalCorpus: boolean } {
  const merged = { ...fallback, ...seed };
  return {
    ...merged,
    fromInternalCorpus: merged.fromInternalCorpus ?? true,
  };
}

export function attachCitation(doc: SourceDocument): SourceDocument {
  if (doc.status === 'indexing') {
    return doc;
  }

  if (doc.status === 'unauthorized') {
    const seed = CATALOG[doc.name];
    return {
      ...doc,
      citation: withCorpusFlag(seed, {
        health: 'restricted',
        trustLabel: 'Restricted access',
        excerpt: 'Document exists but cannot be read without authorization.',
        registryLabel: 'Access control',
        detail: 'Permission pending — not included in cited answer text.',
      }),
    };
  }

  const seed = CATALOG[doc.name];
  if (!seed) {
    return {
      ...doc,
      citation: withCorpusFlag(undefined, {
        health: 'pending',
        trustLabel: 'Validating…',
        excerpt: 'Citation validation pending official registry sync.',
        registryLabel: 'Libra registry',
      }),
    };
  }

  return {
    ...doc,
    citation: withCorpusFlag(seed, seed),
  };
}

export function withCitations(sources: SourceDocument[]): SourceDocument[] {
  return sources.map(attachCitation);
}

/** Warning badges are held back, so those sources stay out of the pill row. */
export function sourcesWithBadges(sources: SourceDocument[]): SourceDocument[] {
  return sources.filter((doc) => doc.citation?.health !== 'superseded');
}
