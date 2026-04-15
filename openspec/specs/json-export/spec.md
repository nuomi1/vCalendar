# json-export Specification

## Purpose

TBD - created by archiving change a-share-ipo-subscription-calendar-generator. Update Purpose after archive.

## Requirements

### Requirement: Use canonical-json library for serialization

The system MUST use the `canonical-json` library for JSON serialization, which provides deterministic output compliant with RFC 8785 (JSON Canonicalization Scheme).

#### Scenario: Library usage

- **WHEN** JSON serialization is required
- **THEN** use `canonical-json` library with `space: 2` for 2-space indentation

#### Scenario: RFC 8785 compliance

- **WHEN** a JSON file is generated
- **THEN** the output is RFC 8785 compliant with keys sorted in UTF-16 code unit order

### Requirement: Export JSON with alphabetical key sorting

The system MUST export JSON with all keys sorted in alphabetical order (handled by canonical-json).

#### Scenario: Key ordering

- **WHEN** a JSON file is generated
- **THEN** all object keys appear in alphabetical order

#### Scenario: Nested object ordering

- **WHEN** nested objects exist
- **THEN** each object's keys are independently sorted alphabetically

### Requirement: Use 2-space indentation

The system MUST use exactly 2 spaces for JSON indentation (fixed internally, not configurable).

#### Scenario: Indentation check

- **WHEN** a JSON file is serialized
- **THEN** each indentation level uses exactly 2 spaces

#### Scenario: Internal configuration

- **WHEN** the JSON serialization function is called
- **THEN** indentation is fixed at 2 spaces, no indent parameter accepted

### Requirement: Export JSON files by instrument

The system MUST export JSON files using names `zh_CN.stocks.json`, `zh_CN.bonds.json`, and `zh_CN.reits.json`.

#### Scenario: Full JSON export execution

- **WHEN** the export job runs with records available for all three instrument types
- **THEN** the system produces three JSON files: `zh_CN.stocks.json`, `zh_CN.bonds.json`, `zh_CN.reits.json`

#### Scenario: No data for one instrument

- **WHEN** one instrument type has no records
- **THEN** the JSON exports as an empty array `[]`

### Requirement: Export valid JSON structure per instrument

The system MUST export JSON arrays for each instrument type.

#### Scenario: Full export with events

- **WHEN** export runs with records available
- **THEN** JSON contains an array of event objects

#### Scenario: Empty instrument JSON

- **WHEN** one instrument type has no records
- **THEN** the JSON exports as an empty array `[]`

### Requirement: Preserve event data mapping

The system MUST map each input record to a JSON object with consistent field names.

#### Input/Output Type Mapping

Input records (from `a-share-ipo-ingestion`) use `Date | null` types. When exported to JSON, date fields are converted to `string | null` via `formatDate()`.

#### Scenario: Model fields (stored)

- **WHEN** a record is exported to JSON
- **THEN** the JSON object contains model fields:
  - `name`: string - 证券简称
  - `code`: string - 证券代码
  - `issuanceDate`: string | null - 发行日 (Date → string via formatDate())
  - `issuancePrice`: number | null - 发行价
  - `publicationDate`: string | null - 公布日 (Date | null → string | null via formatDate())
  - `listingDate`: string | null - 上市日 (Date | null → string | null via formatDate())

#### Scenario: Derived fields (computed)

- **WHEN** a record is exported to JSON
- **THEN** the JSON object contains derived fields:
  - `market`: string - 市场 (calls `inferMarket(code)` from `inference-rules`)
  - `instrumentType`: string - 标的类型 (calls `inferInstrumentType(code)` from `inference-rules`)

#### Scenario: Missing optional fields

- **WHEN** optional fields are missing in input
- **THEN** the JSON field value is `null`
