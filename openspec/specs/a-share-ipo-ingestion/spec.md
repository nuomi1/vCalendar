# a-share-ipo-ingestion Specification

## Purpose

Define the input data model and validation rules for A-share IPO subscription calendar generation.

## Input Model

Instrument records are pre-normalized into three separate arrays: `stocks`, `bonds`, and `reits`.

### Instrument Record Fields

Each instrument record contains these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | 证券简称 |
| `code` | string | Yes | 证券代码 |
| `issuanceDate` | Date | Yes | 发行日 |
| `issuancePrice` | number \| null | No | 发行价 |
| `publicationDate` | Date \| null | No | 公布日 |
| `listingDate` | Date \| null | No | 上市日 |

**Note:** `market` and `instrumentType` are **not** stored in the model. They are derived at export time by calling `inferMarket(code)` and `inferInstrumentType(code)` from the `inference-rules` module.

## Requirements

### Requirement: Accept pre-normalized instrument arrays

The system MUST accept already-prepared subscription datasets as three separate arrays: `stocks`, `bonds`, and `reits`, and process each array independently.

#### Scenario: Independent array processing

- **WHEN** input includes `stocks`, `bonds`, and `reits` arrays
- **THEN** each array is handled as an independent export stream without cross-array merge

#### Scenario: Empty instrument array

- **WHEN** one instrument array is empty
- **THEN** the system still treats that array as a valid input stream

### Requirement: Enforce required issuance date field

The system MUST require issuance date on every input record.

#### Scenario: Issuance date present

- **WHEN** a record contains issuance date
- **THEN** processing may continue for that record

#### Scenario: Issuance date missing

- **WHEN** a record has no issuance date
- **THEN** the system throws an exception

### Requirement: Reference inference rules for market/instrument type

Market and instrument type derivation is governed by the `inference-rules` specification.

#### Scenario: Market inference

- **WHEN** market is needed during export
- **THEN** call `inferMarket(code)` from `inference-rules`

#### Scenario: Instrument type inference

- **WHEN** instrument type is needed during export
- **THEN** call `inferInstrumentType(code)` from `inference-rules`

## API Fetching

### Requirement: Reuse ofetch instance

The ofetch instance SHOULD be reused across all API calls to avoid repeated configuration overhead.

#### Implementation

```typescript
/**
 * 复用的 ofetch 实例
 * 避免每个 API 调用都重新创建实例
 */
const eastMoneyAPI = ofetch.create({
  baseURL: "https://datacenter-web.eastmoney.com/api",
  responseType: "json",
});
```

### Requirement: Shared query builder function

A common function SHOULD be used to build API query parameters, with only instrument-specific fields varying.

#### Implementation

```typescript
interface IPOQueryConfig {
  reportName: string;
  columns: string;
  filterField: string;
  sortColumns: string;
  sortTypes: string;
  /** REITs 专用字段，可选 */
  quoteColumns?: string;
}

/**
 * 构建东方财富 API 查询参数
 * @param config - IPO 类型特定的配置
 * @returns 完整的 query 对象
 * @note startDate 由函数内部通过 getDateFilterStart() 动态获取
 */
function buildIPOQuery(config: IPOQueryConfig): Record<string, unknown> {
  const startDate = getDateFilterStart();
  const query: Record<string, unknown> = {
    client: "WEB",
    columns: config.columns,
    filter: `(${config.filterField}>='${startDate}')`,
    pageNumber: 1,
    pageSize: 50,
    reportName: config.reportName,
    sortColumns: config.sortColumns,
    sortTypes: config.sortTypes,
    source: "WEB",
  };
  if (config.quoteColumns) {
    query.quoteColumns = config.quoteColumns;
  }
  return query;
}
```

### Requirement: Type-safe API response wrapper

API responses SHOULD be wrapped in a type-safe interface.

#### Implementation

```typescript
interface EastMoneyResponse<T> {
  result: {
    data: T[];
  };
}
```
