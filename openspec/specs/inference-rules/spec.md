# Specification: Inference Rules

## Purpose

Inference rules for deriving market and instrument type from security codes using a unified lookup table.

## Data Structure

### Code Prefix Lookup Table

A statically-defined array of code prefix rules, sorted by prefix length (longest first) for correct matching priority:

```typescript
interface CodePrefixRule {
  /** 代码前缀，精确匹配前 N 位 */
  prefix: string;
  /** 所属市场 */
  market: Market;
  /** 证券类型 */
  instrumentType: InstrumentType;
}

/**
 * 代码前缀查找表
 * 按前缀长度降序排列，确保匹配时优先使用更长的前缀
 */
const CODE_PREFIX_RULES: CodePrefixRule[] = [
  // 上交所 - 主板 (600, 601, 603, 605)
  { prefix: "600", market: "SH", instrumentType: "上" },
  { prefix: "601", market: "SH", instrumentType: "上" },
  { prefix: "603", market: "SH", instrumentType: "上" },
  { prefix: "605", market: "SH", instrumentType: "上" },
  // 上交所 - 科创板 (688, 689)
  { prefix: "688", market: "SH", instrumentType: "科" },
  { prefix: "689", market: "SH", instrumentType: "科" },
  // 上交所 - 可转债 (110, 111, 113, 118)
  { prefix: "110", market: "SH", instrumentType: "债" },
  { prefix: "111", market: "SH", instrumentType: "债" },
  { prefix: "113", market: "SH", instrumentType: "债" },
  { prefix: "118", market: "SH", instrumentType: "债" },
  // 上交所 - REITs (508)
  { prefix: "508", market: "SH", instrumentType: "REITs" },
  // 深交所 - 主板 (000, 001, 002, 003, 004)
  { prefix: "000", market: "SZ", instrumentType: "深" },
  { prefix: "001", market: "SZ", instrumentType: "深" },
  { prefix: "002", market: "SZ", instrumentType: "深" },
  { prefix: "003", market: "SZ", instrumentType: "深" },
  { prefix: "004", market: "SZ", instrumentType: "深" },
  // 深交所 - 创业板 (300-309)
  { prefix: "300", market: "SZ", instrumentType: "创" },
  { prefix: "301", market: "SZ", instrumentType: "创" },
  { prefix: "302", market: "SZ", instrumentType: "创" },
  { prefix: "303", market: "SZ", instrumentType: "创" },
  { prefix: "304", market: "SZ", instrumentType: "创" },
  { prefix: "305", market: "SZ", instrumentType: "创" },
  { prefix: "306", market: "SZ", instrumentType: "创" },
  { prefix: "307", market: "SZ", instrumentType: "创" },
  { prefix: "308", market: "SZ", instrumentType: "创" },
  { prefix: "309", market: "SZ", instrumentType: "创" },
  // 深交所 - 可转债 (123, 127, 128)
  { prefix: "123", market: "SZ", instrumentType: "债" },
  { prefix: "127", market: "SZ", instrumentType: "债" },
  { prefix: "128", market: "SZ", instrumentType: "债" },
  // 深交所 - REITs (180, 181)
  { prefix: "180", market: "SZ", instrumentType: "REITs" },
  { prefix: "181", market: "SZ", instrumentType: "REITs" },
  // 北交所 - 股票 (92)
  { prefix: "92", market: "BJ", instrumentType: "北" },
  // 北交所 - 可转债 (810)
  { prefix: "810", market: "BJ", instrumentType: "债" },
];
```

**Matching Order**:
1. 遍历查找表，尝试 `code.startsWith(prefix)` 匹配
2. 返回第一个匹配项的 `market` 和 `instrumentType`
3. 无匹配 → 抛出异常

**Why startsWith instead of range tables**:
- 前缀匹配比数值范围更直观（300-309 实际上是 300, 301, ... 309 的离散前缀）
- 便于未来添加新代码段（如 310）

## Requirements

### Requirement: Complete Security Code Inference Rules

The system SHALL correctly identify market and instrument type from a 6-digit security code WITHOUT requiring a category parameter.

#### Scenario: 上交所 - 股票

- **WHEN** code startsWith "600"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "上"

- **WHEN** code startsWith "601"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "上"

- **WHEN** code startsWith "603"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "上"

- **WHEN** code startsWith "605"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "上"

- **WHEN** code startsWith "688"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "科"

- **WHEN** code startsWith "689"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "科"

#### Scenario: 上交所 - 可转债

- **WHEN** code startsWith "110"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "111"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "113"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "118"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

#### Scenario: 上交所 - REITs

- **WHEN** code startsWith "508"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "REITs"

#### Scenario: 深交所 - 股票

- **WHEN** code startsWith "000"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "深"

- **WHEN** code startsWith "001"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "深"

- **WHEN** code startsWith "002"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "深"

- **WHEN** code startsWith "003"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "深"

- **WHEN** code startsWith "004"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "深"

- **WHEN** code startsWith "300"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "301"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "302"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "303"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "304"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "305"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "306"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "307"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "308"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

- **WHEN** code startsWith "309"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "创"

#### Scenario: 深交所 - 可转债

- **WHEN** code startsWith "123"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

- **WHEN** code startsWith "127"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

- **WHEN** code startsWith "128"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

#### Scenario: 深交所 - REITs

- **WHEN** code startsWith "180"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "REITs"

- **WHEN** code startsWith "181"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "REITs"

#### Scenario: 北交所 - 股票

- **WHEN** code startsWith "92"
- **THEN** inferMarket returns "BJ", inferInstrumentType returns "北"

#### Scenario: 北交所 - 可转债

- **WHEN** code startsWith "810"
- **THEN** inferMarket returns "BJ", inferInstrumentType returns "债"

#### Scenario: 北交所 - REITs

BJSE does not support REITs. No matching rule required.

### Requirement: Unknown Code Handling

The system SHALL explicitly throw exceptions for unrecognized security codes.

#### Scenario: Invalid Security Code

- **WHEN** code does not match any known rules
- **THEN** throw new Error(`无法识别的证券代码: ${code}`)

### Requirement: Function Signature Change

The existing inferMarket and inferInstrumentType functions SHALL be updated to remove the category parameter.

#### Before

```typescript
function inferMarket(code: string): Market;
function inferInstrumentType(code: string, category: string): InstrumentType;
```

#### After

```typescript
function inferMarket(code: string): Market;
function inferInstrumentType(code: string): InstrumentType;
```

### Requirement: Call Sites Update

The category parameter previously used for bonds/reits mapping SHALL be removed from all call sites.

#### Before

- createJSON(records, category)
- createICS(records, category)

#### After

- createJSON(records)
- createICS(records)

### Requirement: Error Handling

Previously, unmatched codes returned default values. This SHALL be changed to throw exceptions.

#### Before

- No rule matched → return "SZ" (default)

#### After

- No rule matched → throw new Error(`无法识别的证券代码: ${code}`)
