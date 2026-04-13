## ADDED Requirements

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
The system MUST map each record fields to JSON object with consistent field names.

#### Scenario: Model fields (stored)
- **WHEN** a record is exported to JSON
- **THEN** the JSON object contains model fields:
  - `name`: string - 证券简称
  - `code`: string - 证券代码
  - `issuanceDate`: string - 发行日
  - `issuancePrice`: number? - 发行价 (null if missing)
  - `publicationDate`: string? - 公布日 (null if missing)
  - `listingDate`: string? - 上市日 (null if missing)

#### Scenario: Derived fields (computed)
- **WHEN** a record is exported to JSON
- **THEN** the JSON object contains derived fields:
  - `market`: string - 市场 (derived from code prefix: SH/SZ/BJ)
  - `instrumentType`: string - 标的类型 (derived from code prefix + array source: 上/科/深/创/北/债/REITs)

#### Scenario: Missing optional fields
- **WHEN** optional fields are missing in input
- **THEN** the JSON field value is `null`