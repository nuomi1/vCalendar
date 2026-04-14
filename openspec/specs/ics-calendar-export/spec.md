# ics-calendar-export Specification

## Purpose

TBD - created by archiving change a-share-ipo-subscription-calendar-generator. Update Purpose after archive.

## Requirements

### Requirement: Generate one event per record

The system MUST generate exactly one calendar event per input record, using issuance date as the event date.

#### Scenario: Valid issuance record

- **WHEN** a record includes issuance date
- **THEN** the system creates one calendar event for that record

#### Scenario: Missing issuance date

- **WHEN** a record does not include issuance date
- **THEN** the system throws an exception instead of generating an event

### Requirement: Export subscription calendar events as ICS

The system MUST export subscription calendar events to standards-compliant ICS payloads containing stable UID, DTSTART, DTEND, SUMMARY, and DESCRIPTION fields for each event.

#### Scenario: ICS export request with available events

- **WHEN** a client requests export for an instrument stream containing issuance records
- **THEN** the system returns an ICS document containing one VEVENT per input record

#### Scenario: ICS export request with no events

- **WHEN** a client requests export for an instrument stream containing no records
- **THEN** the system returns a valid ICS document with no VEVENT entries

### Requirement: Preserve event identity across exports

The system MUST generate event UID as `securityCode.market` and keep it stable across exports.

#### Scenario: Repeated export without data changes

- **WHEN** the same record is exported multiple times
- **THEN** the exported VEVENT keeps the same UID value

#### Scenario: UID market format

- **WHEN** a record has security code (market is inferred from code)
- **THEN** UID is formatted exactly as `<securityCode>.<market>`

### Requirement: Reject duplicate UID within one export stream

The system MUST throw an exception when duplicate `securityCode.market` appears within the same instrument export stream.

#### Scenario: Duplicate UID in stocks stream

- **WHEN** two stock records produce the same UID in one export run
- **THEN** export fails with an exception

#### Scenario: UID uniqueness across independent streams

- **WHEN** stock and bond streams each contain the same UID value
- **THEN** each stream is validated independently and does not conflict with the other stream

### Requirement: Use fixed non-all-day event time

The system MUST export each VEVENT as non-all-day with fixed local time window `09:30` to `10:00` on issuance date.

#### Scenario: VEVENT timing

- **WHEN** a VEVENT is serialized
- **THEN** DTSTART/DTEND represent issuance date at `09:30` and `10:00` in system timezone

### Requirement: Use ical-generator for ICS editing and serialization

The system MUST use `ical-generator` to create, edit, and serialize VCALENDAR/VEVENT components.

#### Scenario: Calendar creation with ical-generator

- **WHEN** a VCALENDAR is created
- **THEN** use `ical({ name: '...', prodId: '...' })` to instantiate the calendar

#### Scenario: Event creation using createEvent() API

- **WHEN** creating a VEVENT component
- **THEN** use `calendar.createEvent({ ... })` with object properties (uid, summary, description, start, end)

#### Scenario: Time handling uses JavaScript Date objects

- **WHEN** creating event with start/end times
- **THEN** use JavaScript `Date` objects directly (e.g., `new Date('2026-04-15T09:30:00')`)

### Requirement: Export ICS files by instrument

The system MUST export ICS files using names `zh_CN.stocks.ics`, `zh_CN.bonds.ics`, and `zh_CN.reits.ics`.

#### Scenario: Full ICS export execution

- **WHEN** the export job runs with events available for all three instrument types
- **THEN** the system produces three ICS files: `zh_CN.stocks.ics`, `zh_CN.bonds.ics`, `zh_CN.reits.ics`

#### Scenario: No data for one instrument

- **WHEN** one instrument type has no events in the export window
- **THEN** the system still emits the corresponding `zh_CN.<instrument>.ics` file with valid empty content

### Requirement: Keep instrument exports separated

The system MUST process and export `stocks`, `bonds`, and `reits` as three independent datasets.

#### Scenario: Independent export generation

- **WHEN** export job runs with all three arrays provided
- **THEN** the system generates each ICS file from only its corresponding array

### Requirement: Fill missing description fields with placeholder

The system MUST render missing description fields as `--` in ICS event descriptions.

#### Scenario: Missing listing date

- **WHEN** listing date is absent in input record
- **THEN** description includes listing date field with value `--`

#### Scenario: Missing issuance price

- **WHEN** issuance price is absent in input record
- **THEN** description includes issuance price field with value `--`

### Requirement: Format SUMMARY with instrument type prefix

The system MUST format SUMMARY as `【类型简称】名称 代码.市场`.

#### Scenario: Stock summary format

- **WHEN** a stock event is generated
- **THEN** SUMMARY starts with `【上/科/深/创/北】` followed by name, code, and market

#### Scenario: Bond summary format

- **WHEN** a bond event is generated
- **THEN** SUMMARY starts with `【债】` followed by name, code, and market

#### Scenario: REITs summary format

- **WHEN** a reits event is generated
- **THEN** SUMMARY starts with `【REITs】` followed by name, code, and market

### Requirement: ICS output validation

The system MUST verify ICS output matches expected format through string comparison.

#### Scenario: Output string format verification

- **WHEN** recordToICS generates ICS content
- **THEN** the output string contains required VCALENDAR/VEVENT structure with correct field values

#### Scenario: VCALENDAR header verification

- **WHEN** ICS is generated
- **THEN** output contains "BEGIN:VCALENDAR", "VERSION:2.0", and "PRODID:-//A-Share IPO Calendar//EN"

#### Scenario: VEVENT field verification

- **WHEN** VEVENT is generated from IPORecord
- **THEN** output contains BEGIN:VEVENT, UID, DTSTART, DTEND, SUMMARY, DESCRIPTION, END:VEVENT

### Requirement: Validate issuance date exists per record

The system MUST throw an exception when a record does not include issuance date.

#### Scenario: Missing issuance date

- **WHEN** a record does not include issuance date
- **THEN** the system throws an exception instead of generating an event
