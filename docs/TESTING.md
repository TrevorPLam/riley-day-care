# Testing Infrastructure Documentation

## Overview

The active test configuration for this repository is consolidated under `testing-infrastructure/`.

- `vitest.config.mts` runs unit tests from `testing-infrastructure/unit/`
- `playwright.config.ts` runs end-to-end tests from `testing-infrastructure/e2e/features/`
- all generated coverage, reports, screenshots, traces, and videos write to `testing-infrastructure/artifacts/`

Legacy root folders such as `__tests__/`, `e2e/`, `playwright-report/`, `test-results/`, and `visual-tests/` are no longer the canonical targets for the current configs.

## Canonical Layout

```text
testing-infrastructure/
├── artifacts/              # Generated output only
│   ├── coverage/
│   ├── playwright-report/
│   ├── reports/
│   ├── screenshots/
│   ├── test-results/
│   ├── traces/
│   ├── videos/
│   └── visual/
├── config/                 # Shared environment, browser, and threshold config
├── docs/                   # Testing documentation
├── e2e/
│   ├── features/           # Canonical Playwright specs
│   ├── fixtures/
│   ├── global-setup.ts
│   └── global-teardown.ts
├── integration/            # Reserved for future integration suites
├── performance/            # Reserved for future performance suites
├── security/               # Reserved for future security suites
├── unit/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── setup.ts
│   └── test-utils.ts
└── utils/                  # Custom reporters and advanced helpers
```

## Current Execution Model

### Unit tests

- Vitest runs with `jsdom`
- React Testing Library and `@testing-library/jest-dom` are configured in `testing-infrastructure/unit/setup.ts`
- the canonical include pattern is `testing-infrastructure/unit/**/*.{test,spec}.{ts,tsx}`
- JSON results and coverage reports are written under `testing-infrastructure/artifacts/`

### End-to-end tests

- Playwright runs from `testing-infrastructure/e2e/features/`
- browser setup, global setup, and teardown are centralized under `testing-infrastructure/e2e/`
- generated artifacts now write under `testing-infrastructure/artifacts/`
- `*.enhanced.spec.ts` files are excluded from the default Playwright run until they are stabilized against the current application UI

## Key Commands

- `npm run test:run` runs the canonical Vitest suite
- `npm run test:coverage` writes coverage to `testing-infrastructure/artifacts/coverage`
- `npm run test:e2e` runs the canonical Playwright suite
- `npm run test:cache-stats` prints testing cache metrics
- `npm run test:parallel-stats` prints parallel execution metrics
- `npm run test:clean` removes generated test artifacts from both canonical and legacy output folders

## Notes

- the repository still contains legacy root copies of some test files; the active configs do not target them
- if you are adding or updating tests, add them under `testing-infrastructure/unit/` or `testing-infrastructure/e2e/features/`
- if you need screenshots, traces, or coverage output, look under `testing-infrastructure/artifacts/`
