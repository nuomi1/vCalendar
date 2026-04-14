## Context

当前 `utils.ts` 中的 `formatSummary` 和 `getUID` 函数接受独立参数，而项目中已定义 `IPORecord` 类型包含所有必要字段。本次重构旨在统一函数签名，使 API 更简洁。

### 当前状态

```typescript
// formatSummary 当前签名
export function formatSummary(
  name: string,
  code: string,
  market: Market,
  instrumentType: InstrumentType,
): string

// getUID 当前签名
export function getUID(code: string, market: Market): string
```

## Goals / Non-Goals

**Goals:**
- 将 `formatSummary` 入参改为 `(record: IPORecord)`
- 将 `getUID` 入参改为 `(record: IPORecord)`
- 函数内部自行调用 `inferMarket` 和 `inferInstrumentType` 推导所需参数
- 更新 `createICS` 中的调用方式
- 在 `createEvent` 中添加 `stamp` 属性，使用 `issuanceDate` 当日 0 点（UTC）

**Non-Goals:**
- 不改变函数的返回值逻辑
- 不修改 `inferMarket` 和 `inferInstrumentType` 的现有实现
- 不涉及其他文件的改动（仅限 utils.ts）

## Decisions

### Decision 1: 使用 IPORecord 作为入参

**备选方案：**
- 方案 A：使用 `IPORecord` 作为入参，内部推导参数（本次选择）
- 方案 B：保留原有签名，新增重载函数支持 `IPORecord`

**选择理由：** 方案 A 更简洁，消除重复逻辑，使函数职责更单一。

### Decision 2: 函数内部依次声明 const 变量

```typescript
export function formatSummary(record: IPORecord): string {
  const name = record.name;
  const code = record.code;
  const market = inferMarket(code);
  const instrumentType = inferInstrumentType(code);
  return `【${instrumentType}】${name} ${code}.${market}`;
}
```

**选择理由：** 依次读取属性而不是解构，使代码风格更一致，便于后续维护。

### Decision 3: 添加 stamp 属性

**备选方案：**
- 方案 A：使用 dayjs UTC 模块，设置当日 0 点（本次选择）
- 方案 B：使用当前时间作为 stamp

**选择理由：** ICS 文件的 stamp 应为事件创建时间，使用 issuanceDate 当日 0 点符合 RFC 5545 规范。

```typescript
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// 在 createEvent 中
const stamp = dayjs(record.issuanceDate).utc().hour(0).minute(0).second(0);
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `inferMarket` 或 `inferInstrumentType` 抛异常 | 函数调用失败 | 原有逻辑不变，这些函数已在使用 |
| 重复推导性能开销 | 微乎其微（单次调用） | 如后续有性能问题可缓存 |

**Trade-off:**
- 代码内聚性提升 vs 轻微的性能开销（可忽略）
