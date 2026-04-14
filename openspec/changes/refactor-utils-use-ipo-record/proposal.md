## Why

在 utils.ts 中，`formatSummary` 和 `getUID` 函数目前接受多个独立参数（name, code, market, instrumentType），而 types.ts 中已定义 `IPORecord` 类型包含这些字段。通过重构使用 `IPORecord` 作为入参，可以让函数内部自行推导所需参数，使 API 更简洁、内聚性更强，同时减少调用方的重复逻辑。

## What Changes

- 重构 `formatSummary` 函数：将入参从 `(name, code, market, instrumentType)` 改为 `(record: IPORecord)`，内部使用 `inferMarket` 和 `inferInstrumentType` 推导 market 和 instrumentType
- 重构 `getUID` 函数：将入参从 `(code, market)` 改为 `(record: IPORecord)`，内部使用 `inferMarket` 推导 market
- 更新 `createICS` 函数中的调用方式，使用新的 `IPORecord` 入参方式
- 在 `createICS` 的 `createEvent` 调用中添加 `stamp` 属性，使用 `issuanceDate` 当日 0 点（UTC）

## Impact

- **受影响代码**：`utils.ts` 中的 `formatSummary`、`getUID`、`createICS` 函数
- **API 变化**：`formatSummary` 和 `getUID` 的函数签名发生变化，需要更新调用方
- **依赖**：引入 dayjs UTC 模块
