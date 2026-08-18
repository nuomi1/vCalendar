## Why

东方财富 API 对新股/新债/REITs 申购数据的发布存在滞后，当前 `getDateFilterStart` 仅覆盖上一周，导致部分申购记录可能落在过滤窗口之外而漏报。将起始日期调整为上两周的第一天，扩大检索范围，提高数据完整性。

## What Changes

- `getDateFilterStart`（`utils.ts`）：日期偏移从 `subtract(1, "week")` 改为 `subtract(2, "week")`，过滤起始日期从「上一周第一天（周日）」变为「上二周的第一天（周日）」。
- 同步更新 `utils.ts` 中该函数的 JSDoc 注释。
- `buildIPOQuery` 生成的 `filter` 起始日期随之提前一周，覆盖更宽的 `SUBSCRIBE_START_DATE` 范围。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `a-share-ipo-ingestion`: API 查询起始日期从「上一周第一天（周日）」改为「上二周的第一天（周日）」，扩大 IPO 申购记录检索窗口。

## Impact

- 代码：`utils.ts` 中 `getDateFilterStart` 及 JSDoc 注释。
- 规格：`openspec/specs/a-share-ipo-ingestion/spec.md` 中 Shared query builder function 的 Implementation 注释说明。
- 行为：所有三类 IPO（股票/债券/REITs）的 API 查询起始日期统一提前一周。
- 非目标：`pageSize: 50` 保持不变，不调整。
