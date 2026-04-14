## Context

现有 `utils.ts` 中的 `inferMarket` 和 `inferInstrumentType` 函数使用简单的前缀匹配规则，存在以下问题：

1. **规则不完整**：仅覆盖部分上交所/深交所/北交所代码
2. **缺少异常处理**：未匹配规则时返回默认的 `SZ`，可能导致数据混淆
3. **需要 category 参数**：调用时需要传入 category 参数，不够简洁

## Goals / Non-Goals

**Goals:**
- 移除 category 参数，仅需 code 即可推断
- 完整的匹配规则覆盖上交所/深交所/北交所
- 未匹配规则时显式抛出异常

**Non-Goals:**
- 不修改 ICS/JSON 生成逻辑的核心流程
- 不添加新的 API 接口

## Match Order

```
┌─────────────────────────────────────────────────────────────┐
│              匹配顺序（三个维度）                           │
├─────────────────────────────────────────────────────────────┤
│  1. 交易所顺序：上交所 → 深交所 → 北交所                    │
│  2. 标的类型顺序：股票 → 可转债 → REITs                   │
│  3. 同一标的类型内：按数字从小到大顺序判断              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### inferMarket

```typescript
export function inferMarket(code: string): Market {
  // === 上交所 SH ===
  // 股票（按数字从小到大：600, 601, 603, 605, 688, 689）
  if (code.startsWith("600") || code.startsWith("601") ||
      code.startsWith("603") || code.startsWith("605") ||
      code.startsWith("688") || code.startsWith("689")) {
    return "SH";
  }
  // 可转债（按数字从小到大：110, 111, 113, 118）
  if (code.startsWith("110") || code.startsWith("111") ||
      code.startsWith("113") || code.startsWith("118")) {
    return "SH";
  }
  // REITs（508）
  if (code.startsWith("508")) {
    return "SH";
  }

  // === 深交所 SZ ===
  // 股票（按数字从小到大：000, 001, 002, 003, 004, 300-309）
  if (code.startsWith("000") || code.startsWith("001") ||
      code.startsWith("002") || code.startsWith("003") ||
      code.startsWith("004")) {
    return "SZ";
  }
  if (code.startsWith("300") || code.startsWith("301") || code.startsWith("302") ||
      code.startsWith("303") || code.startsWith("304") || code.startsWith("305") ||
      code.startsWith("306") || code.startsWith("307") || code.startsWith("308") ||
      code.startsWith("309")) {
    return "SZ";
  }
  // 可转债（按数字从小到大：123, 127, 128）
  if (code.startsWith("123") || code.startsWith("127") || code.startsWith("128")) {
    return "SZ";
  }
  // REITs（按数字从小到大：180, 181）
  if (code.startsWith("180") || code.startsWith("181")) {
    return "SZ";
  }

  // === 北交所 BJ ===
  // 股票（92）
  if (code.startsWith("92")) {
    return "BJ";
  }
  // 可转债（810）
  if (code.startsWith("810")) {
    return "BJ";
  }

  // ❌ 无匹配
  throw new Error(`无法识别的证券代码: ${code}`);
}
```

### inferInstrumentType

```typescript
export function inferInstrumentType(code: string): InstrumentType {
  // === 上交所 SH ===
  // 股票（按数字从小到大：600, 601, 603, 605 → 上；688, 689 → 科）
  if (code.startsWith("600") || code.startsWith("601") ||
      code.startsWith("603") || code.startsWith("605")) {
    return "上";
  }
  if (code.startsWith("688") || code.startsWith("689")) {
    return "科";
  }
  // 可转债（按数字从小到大：110, 111, 113, 118）
  if (code.startsWith("110") || code.startsWith("111") ||
      code.startsWith("113") || code.startsWith("118")) {
    return "债";
  }
  // REITs（508）
  if (code.startsWith("508")) {
    return "REITs";
  }

  // === 深交所 SZ ===
  // 股票（按数字从小到大：000, 001, 002, 003, 004 → 深；300-309 → 创）
  if (code.startsWith("000") || code.startsWith("001") ||
      code.startsWith("002") || code.startsWith("003") ||
      code.startsWith("004")) {
    return "深";
  }
  if (code.startsWith("300") || code.startsWith("301") || code.startsWith("302") ||
      code.startsWith("303") || code.startsWith("304") || code.startsWith("305") ||
      code.startsWith("306") || code.startsWith("307") || code.startsWith("308") ||
      code.startsWith("309")) {
    return "创";
  }
  // 可转债（按数字从小到大：123, 127, 128）
  if (code.startsWith("123") || code.startsWith("127") || code.startsWith("128")) {
    return "债";
  }
  // REITs（按数字从小到大：180, 181）
  if (code.startsWith("180") || code.startsWith("181")) {
    return "REITs";
  }

  // === 北交所 BJ ===
  // 股票（92）
  if (code.startsWith("92")) {
    return "北";
  }
  // 可转债（810）
  if (code.startsWith("810")) {
    return "债";
  }

  // ❌ 无匹配
  throw new Error(`无法识别的证券代码: ${code}`);
}
```

## Call Sites Update

### createJSON

```typescript
// Before
export function createJSON(records: IPORecord[], category: string): string

// After
export function createJSON(records: IPORecord[]): string
```

### createICS

```typescript
// Before
export function createICS(records: IPORecord[], category: string): string

// After
export function createICS(records: IPORecord[]): string
```

## Risks / Trade-offs

| 风险 | Mitigation |
|------|-------------|
| 规则复杂可能导致遗漏边界情况 | 添加全覆盖测试用例 |
| 异常处理可能导致上游崩溃 | 添加 try-catch 文档 |