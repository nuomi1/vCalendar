# ipo-calendar-event-generation Specification

## Purpose
TBD - created by archiving change a-share-ipo-subscription-calendar-generator. Update Purpose after archive.
## Requirements
### Requirement: Generate one issuance event per record
The system MUST generate exactly one calendar event per input record, using issuance date as the event date.

#### Scenario: Valid issuance record
- **WHEN** a record includes issuance date
- **THEN** the system creates one calendar event for that record

#### Scenario: Missing issuance date
- **WHEN** a record does not include issuance date
- **THEN** the system throws an exception instead of generating an event

### Requirement: Use fixed non-all-day issuance time
The system MUST set event time to a fixed non-all-day window from `09:30` to `10:00` in system timezone.

#### Scenario: Event time assignment
- **WHEN** an issuance event is generated
- **THEN** `DTSTART` is set to `09:30` and `DTEND` is set to `10:00` on issuance date

#### Scenario: Timezone handling
- **WHEN** an event timestamp is generated
- **THEN** the timestamp uses system timezone (expected `Asia/Shanghai`)

### Requirement: Populate SUMMARY with instrument type prefix
The system MUST include instrument type abbreviation as prefix in SUMMARY.

#### Scenario: Stock event
- **WHEN** a stock event is generated
- **THEN** SUMMARY format is `【上/科/深/创/北】<name> <code>.<market>`

#### Scenario: Bond event
- **WHEN** a bond event is generated
- **THEN** SUMMARY format is `【债】<name> <code>.<market>`

#### Scenario: REITs event
- **WHEN** a reits event is generated
- **THEN** SUMMARY format is `【REITs】<name> <code>.<market>`

### Requirement: Populate DESCRIPTION with fallback placeholder
The system MUST include issuance price, publication date, and listing date in event description, and MUST render missing description fields as `--`.

#### Scenario: Full description fields
- **WHEN** price, publication date, and listing date are all present
- **THEN** event description includes all actual values

#### Scenario: Partial description fields
- **WHEN** price, publication date, or listing date is missing
- **THEN** the missing field is rendered as `--` in description

### Requirement: Keep streams separated by instrument array
The system MUST keep stock, bond, and REITs event streams separated according to input arrays.

#### Scenario: Mixed overall input
- **WHEN** records exist in all three arrays
- **THEN** event generation keeps three independent output streams without cross-array merge

