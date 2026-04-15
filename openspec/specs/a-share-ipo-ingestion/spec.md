# a-share-ipo-ingestion Specification

## Purpose

Define the input data model and validation rules for A-share IPO subscription calendar generation.

## Input Model

Instrument records are pre-normalized into three separate arrays: `stocks`, `bonds`, and `reits`.

### Instrument Record Fields

Each instrument record contains these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | 证券简称 |
| `code` | string | Yes | 证券代码 |
| `issuanceDate` | Date | Yes | 发行日 |
| `issuancePrice` | number \| null | No | 发行价 |
| `publicationDate` | Date \| null | No | 公布日 |
| `listingDate` | Date \| null | No | 上市日 |

**Note:** `market` and `instrumentType` are **not** stored in the model. They are derived at export time by calling `inferMarket(code)` and `inferInstrumentType(code)` from the `inference-rules` module.

## Requirements

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

### Requirement: Reference inference rules for market/instrument type

Market and instrument type derivation is governed by the `inference-rules` specification.

#### Scenario: Market inference

- **WHEN** market is needed during export
- **THEN** call `inferMarket(code)` from `inference-rules`

#### Scenario: Instrument type inference

- **WHEN** instrument type is needed during export
- **THEN** call `inferInstrumentType(code)` from `inference-rules`
