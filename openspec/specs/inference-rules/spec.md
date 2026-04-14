# Specification: Inference Rules

## Purpose

TBD - Inference rules for deriving market and instrument type from security codes.

## Requirements

### Requirement: Complete Security Code Inference Rules

The system SHALL correctly identify market and instrument type from a 6-digit security code WITHOUT requiring a category parameter.

#### Matching Order
1. Exchange order: 上交所 (SH) → 深交所 (SZ) → 北交所 (BJ)
2. Within each exchange: 股票 (stocks) → 可转债 (bonds) → REITs
3. Within same instrument type: ascending numeric order

#### Scenario: Shanghai Stock Exchange - 股票
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

#### Scenario: Shanghai Stock Exchange - 可转债
- **WHEN** code startsWith "110"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "111"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "113"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

- **WHEN** code startsWith "118"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "债"

#### Scenario: Shanghai Stock Exchange - REITs
- **WHEN** code startsWith "508"
- **THEN** inferMarket returns "SH", inferInstrumentType returns "REITs"

#### Scenario: Shenzhen Stock Exchange - 股票
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

#### Scenario: Shenzhen Stock Exchange - 可转债
- **WHEN** code startsWith "123"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

- **WHEN** code startsWith "127"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

- **WHEN** code startsWith "128"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "债"

#### Scenario: Shenzhen Stock Exchange - REITs
- **WHEN** code startsWith "180"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "REITs"

- **WHEN** code startsWith "181"
- **THEN** inferMarket returns "SZ", inferInstrumentType returns "REITs"

#### Scenario: Beijing Stock Exchange - 股票
- **WHEN** code startsWith "92"
- **THEN** inferMarket returns "BJ", inferInstrumentType returns "北"

#### Scenario: Beijing Stock Exchange - 可转债
- **WHEN** code startsWith "810"
- **THEN** inferMarket returns "BJ", inferInstrumentType returns "债"

#### Scenario: Beijing Stock Exchange - REITs
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
function inferMarket(code: string): Market
function inferInstrumentType(code: string, category: string): InstrumentType
```

#### After
```typescript
function inferMarket(code: string): Market
function inferInstrumentType(code: string): InstrumentType
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