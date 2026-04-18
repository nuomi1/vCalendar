# vcalendar

A-Share IPO Calendar Generator - fetches IPO data from EastMoney API and generates ICS/JSON calendar files.

## Features

- **API Integration**: Fetches IPO subscription data from EastMoney API (stocks, bonds, REITs)
- **Automatic Market Inference**: Derives market (SH/SZ/BJ) and instrument type from security code prefix
- **Calendar Export**: Generates `zh_CN.{stocks,bonds,reits}.ics` files (09:30-10:00 non-all-day events)
- **JSON Export**: Generates `zh_CN.{stocks,bonds,reits}.json` files with RFC 8785 canonical JSON

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

// Generate calendar from API (auto-fetches from EastMoney)
await generateCalendar();
```

## Programmatic Usage

```typescript
import { generateCalendar } from './index';
import type { InputData } from './types';

// Generate calendar from pre-fetched data
const data: InputData = {
  stocks: [{ name: '测试', code: '001312', issuanceDate: new Date('2026-04-15'), issuancePrice: 10.5, publicationDate: null, listingDate: null }],
  bonds: [],
  reits: []
};

await generateCalendar(data);
```

## Tests

```bash
bun test
```