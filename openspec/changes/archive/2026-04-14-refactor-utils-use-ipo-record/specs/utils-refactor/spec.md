## ADDED Requirements

### Requirement: Utils function refactoring
This change refactors utility functions in utils.ts to use IPORecord as input parameter instead of multiple separate parameters.

#### Scenario: formatSummary with IPORecord
- **WHEN** formatSummary is called with an IPORecord containing name and code
- **THEN** the function internally derives market and instrumentType using inferMarket and inferInstrumentType, then returns the formatted summary string

#### Scenario: getUID with IPORecord
- **WHEN** getUID is called with an IPORecord containing code
- **THEN** the function internally derives market using inferMarket, then returns the UID string
