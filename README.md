# Libra AI — Reasoning Trace (Design Engineer prototype)

Modular React + TypeScript demo of the **Reasoning Trace** component for Libra (legal AI assistant).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- Framer Motion

## Project structure

```text
src/
├── types/trace.ts
├── data/mockScenarios.ts
├── hooks/useDemoTrace.ts
├── components/
│   ├── ReasoningTrace/
│   └── DevToolbar.tsx
└── App.tsx
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Demo toolbar

- **Quick search (1.5s)** — fast path to `done`
- **Dense / long search (6–8s)** — progressive sources and `+N more` pill overflow
- **Permission block** — stops on `waiting` until you authorize or ignore
- **Manual** — force `active`, `waiting`, or `done`
- **Reduced motion** — simulates `prefers-reduced-motion` (disables shimmer and motion)

## Build

```bash
npm run build
```
