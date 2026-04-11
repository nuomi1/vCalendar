# vcalendar

A-Share IPO Calendar Generator - generates ICS/JSON calendar files from structured IPO subscription data.

## Features

- Input: Accepts structured arrays for stocks, bonds, and REITs
- Output: Generates `zh_CN.{stocks,bonds,reits}.ics` and `.json` files
- Event time: Fixed 09:30-10:00 (non-all-day) on issuance date
- Automatic market/inference: Derives market (SH/SZ/BJ) and instrument type from security code

## This Phase

**Does NOT include:** Exchange data scraping, API parsing, pagination, or retry logic.

This module accepts pre-normalized input arrays and maps them directly to ICS/JSON exports.

## Install

```bash
bun install
```

## Run

```bash
bun run index.ts
```

## API

```typescript
import { generateCalendar } from './index';

await generateCalendar(
  {
    stocks: [{ name: '测试', code: '001312', issuanceDate: '2026-04-15' }],
    bonds: [],
    reits: []
  },
  { outputDir: './output', jsonIndent: 2 },
  './output'
);
```

## Tests

```bash
bun test
```