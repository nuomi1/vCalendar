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
bun run securities/index.ts
```

> 输出文件（`zh_CN.*.ics` / `zh_CN.*.json`）始终写入当前工作目录，
> 因此请在仓库根目录执行上述命令。

## API

```typescript
import { generateCalendar } from "./securities/index";

// Generate calendar from API (auto-fetches from EastMoney)
await generateCalendar();
```

## Programmatic Usage

```typescript
import { generateCalendar } from "./securities/index";
import type { InputData } from "./securities/types";

// Generate calendar from pre-fetched data
const data: InputData = {
  stocks: [
    {
      name: "测试",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: 10.5,
      publicationDate: null,
      listingDate: null,
    },
  ],
  bonds: [],
  reits: [],
};

await generateCalendar(data);
```

## Tests

```bash
bun test
```
