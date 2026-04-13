## ADDED Requirements

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

### Requirement: Define instrument record model fields
The system MUST use a consistent model structure for instrument records.

#### Scenario: Instrument record model
- **WHEN** an instrument record (stock/bond/reits) is provided
- **THEN** it contains these fields:
  - `name`: string (required) - 证券简称
  - `code`: string (required) - 证券代码
  - `issuanceDate`: date (required) - 发行日
  - `issuancePrice`: number | null - 发行价
  - `publicationDate`: Date | null - 公布日
  - `listingDate`: Date | null - 上市日

Note: `market` and `instrumentType` are derived from code prefix, not stored in the model.

### Requirement: Infer market and instrument type from security code
The system MUST derive market code and instrument type abbreviation from the security code.

#### Scenario: Shanghai Main Board stock (6-digit code starting with 6)
- **WHEN** a stock code starts with `6` (not 688)
- **THEN** market is `SH` and instrument type is `上` (上交所主板)

#### Scenario: STAR Market stock (688 prefix)
- **WHEN** a stock code starts with `688`
- **THEN** market is `SH` and instrument type is `科` (上交所科创板)

#### Scenario: Shenzhen Main Board stock (000/001 prefix)
- **WHEN** a stock code starts with `000` or `001`
- **THEN** market is `SZ` and instrument type is `深` (深交所主板)

#### Scenario: ChiNext stock (300 prefix)
- **WHEN** a stock code starts with `300`
- **THEN** market is `SZ` and instrument type is `创` (深交所创业板)

#### Scenario: Beijing Stock Exchange stock (8/4 digit code)
- **WHEN** a stock code starts with `8` or `4`
- **THEN** market is `BJ` and instrument type is `北` (北交所主板)

#### Scenario: Convertible bond
- **WHEN** a bond record is provided
- **THEN** market is inferred and instrument type is `债` (可转债)

#### Scenario: REITs
- **WHEN** a reits record is provided
- **THEN** market is inferred and instrument type is `REITs` (REITs 基金)