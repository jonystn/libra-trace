import type { DemoScenario, SourceDocument, SourceEffort } from '../types/trace';

const denseSourcesMid: SourceDocument[] = [
  { id: '1', name: 'BGB § 823.pdf', status: 'verified' },
  { id: '2', name: 'BGH VI ZR 252_19.pdf', status: 'indexing' },
  { id: '3', name: 'OLG_Muenchen_2023.docx', status: 'indexing' },
  { id: '4', name: 'Commentary_Schwan_Tort.pdf', status: 'indexing' },
  { id: '5', name: 'Firm_Precedent_Index.xlsx', status: 'indexing' },
  { id: '6', name: 'EU_Directive_85_374.pdf', status: 'indexing' },
];

function readDoc(doc: SourceDocument, effort: SourceEffort): SourceDocument {
  return { ...doc, status: 'indexing', effort };
}

function doneDoc(doc: SourceDocument): SourceDocument {
  return {
    id: doc.id,
    name: doc.name,
    status: doc.status === 'unauthorized' ? 'unauthorized' : 'verified',
  };
}

/** Final dense frame: mixed trust + one inaccessible source (briefing). */
const denseSourcesFull: SourceDocument[] = [
  { id: '1', name: 'BGB § 823.pdf', status: 'verified' },
  { id: '2', name: 'BGH VI ZR 252_19.pdf', status: 'verified' },
  { id: '3', name: 'OLG_Muenchen_2023.docx', status: 'verified' },
  { id: '4', name: 'Commentary_Schwan_Tort.pdf', status: 'verified' },
  { id: '5', name: 'Firm_Precedent_Index.xlsx', status: 'verified' },
  { id: '6', name: 'EU_Directive_85_374.pdf', status: 'verified' },
  { id: '7', name: 'Minuta_Contract_Confidential.pdf', status: 'unauthorized' },
];

export const MOCK_SCENARIOS: Record<DemoScenario['id'], DemoScenario> = {
  quick: {
    id: 'quick',
    label: 'Quick search',
    active: {
      message: 'Searching Statutes & Case Law',
      sources: [
        { id: 'q1', name: 'BGB § 823.pdf', status: 'verified' },
        { id: 'q2', name: 'BGH_Key_Ruling_2022.pdf', status: 'indexing', effort: 'intense' },
      ],
    },
    waiting: {
      documentName: 'Client_Matter_Brief_CONF.pdf',
      reason: 'This document requires read permission before external analysis.',
    },
    done: {
      durationSeconds: 1,
      auditSteps: [
        { id: 'a1', label: 'Analyzed query', kind: 'check' },
        { id: 'a2', label: 'Clarifying legal context', kind: 'check' },
        {
          id: 'a3',
          label: 'Searched Statutes & Case Law',
          kind: 'search',
          consultedSourceIds: ['q1'],
        },
        { id: 'a4', label: 'Identifying missing data', kind: 'check' },
        {
          id: 'a5',
          label: 'Searched Statutes & Case Law',
          kind: 'search',
          consultedSourceIds: ['q2'],
        },
      ],
    },
    sourceTimeline: [
      {
        atMs: 1300,
        sources: [
          { id: 'q1', name: 'BGB § 823.pdf', status: 'verified' },
          { id: 'q2', name: 'BGH_Key_Ruling_2022.pdf', status: 'indexing', effort: 'intense' },
        ],
      },
      {
        atMs: 1800,
        sources: [
          { id: 'q1', name: 'BGB § 823.pdf', status: 'verified' },
          { id: 'q2', name: 'BGH_Key_Ruling_2022.pdf', status: 'verified' },
        ],
      },
    ],
    activePhaseTimeline: [
      { atMs: 0, phase: 'analyzing' },
      { atMs: 450, phase: 'thinking' },
      { atMs: 900, phase: 'clarifying' },
      { atMs: 1200, phase: 'searching' },
    ],
    completeAtMs: 2200,
  },
  dense: {
    id: 'dense',
    label: 'Dense / long search',
    active: {
      message: 'Searching Statutes & Case Law',
      sources: [denseSourcesMid[0]],
    },
    waiting: {
      documentName: 'Client_Matter_Brief_CONF.pdf',
      reason: 'This document requires read permission before external analysis.',
    },
    done: {
      durationSeconds: 8.2,
      auditSteps: [
        { id: 'd1', label: 'Analyzed query', kind: 'check' },
        { id: 'd2', label: 'Clarifying legal context', kind: 'check' },
        { id: 'd2b', label: 'Identifying missing data', kind: 'check' },
        { id: 'd3', label: 'Thinking', kind: 'check' },
        {
          id: 'd4',
          label: 'Searched Statutes & Case Law',
          kind: 'search',
          consultedSourceIds: ['1', '2', '3'],
        },
        {
          id: 'd5',
          label: 'Searched Statutes & Case Law',
          kind: 'search',
          consultedSourceIds: ['1', '2', '3', '4', '5', '6', '7'],
        },
      ],
    },
    sourceTimeline: [
      {
        atMs: 2000,
        sources: [doneDoc(denseSourcesFull[0]), readDoc(denseSourcesFull[1], 'moderate')],
      },
      {
        atMs: 3600,
        sources: [
          ...denseSourcesFull.slice(0, 2).map(doneDoc),
          readDoc(denseSourcesFull[3], 'deep'),
        ],
      },
      {
        atMs: 6000,
        sources: [
          ...denseSourcesFull.slice(0, 2).map(doneDoc),
          doneDoc(denseSourcesFull[3]),
          readDoc(denseSourcesFull[4], 'intense'),
        ],
      },
      { atMs: 7200, sources: denseSourcesFull },
    ],
    activePhaseTimeline: [
      { atMs: 0, phase: 'analyzing' },
      { atMs: 500, phase: 'thinking' },
      { atMs: 1100, phase: 'clarifying' },
      { atMs: 1800, phase: 'searching' },
    ],
    completeAtMs: 8200,
  },
  blocked: {
    id: 'blocked',
    label: 'Permission block',
    active: {
      message: 'Searching Statutes & Case Law',
      sources: [
        { id: 'b1', name: 'BGB § 823.pdf', status: 'verified' },
        { id: 'b2', name: 'Internal_Contract_Draft.pdf', status: 'indexing' },
      ],
    },
    waiting: {
      documentName: 'Minuta_Contract_Confidential.pdf',
      reason: 'This document is restricted and requires explicit read authorization.',
    },
    done: {
      durationSeconds: 4.1,
      auditSteps: [
        { id: 'b1', label: 'Analyzed query', kind: 'check' },
        { id: 'b2', label: 'Clarifying legal context', kind: 'check' },
        { id: 'b3', label: 'Thinking', kind: 'check' },
        {
          id: 'b4',
          label: 'Searched Statutes & Case Law',
          kind: 'search',
          consultedSourceIds: ['b1', 'b2'],
        },
      ],
    },
    activePhaseTimeline: [
      { atMs: 0, phase: 'analyzing' },
      { atMs: 350, phase: 'thinking' },
      { atMs: 650, phase: 'clarifying' },
      { atMs: 750, phase: 'searching' },
    ],
    stateTimeline: [{ atMs: 2400, state: 'waiting' }],
  },
};

export const DEFAULT_SCENARIO = MOCK_SCENARIOS.quick;
