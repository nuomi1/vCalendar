## MODIFIED Requirements

### Requirement: Shared query builder function

A common function SHOULD be used to build API query parameters, with only instrument-specific fields varying. The filter start date MUST be the first day (Sunday) of the week two weeks before the query date, applied consistently across all instrument types.

#### Scenario: Filter window covers a full week range

- **WHEN** an API query is built at any point during a week
- **THEN** the generated `filter` start date is the Sunday of the week that precedes the query date by two weeks

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
 * @note startDate 由函数内部通过 getDateFilterStart() 动态获取，取上二周的第一天（周日）
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
