# ics-calendar-export Specification (Merged)

This spec now incorporates all requirements from the archived `ipo-calendar-event-generation` spec.

## ADDED Requirements

### Requirement: Validate issuance date exists per record
The system MUST throw an exception when a record does not include issuance date.

#### Scenario: Missing issuance date
- **WHEN** a record does not include issuance date
- **THEN** the system throws an exception instead of generating an event