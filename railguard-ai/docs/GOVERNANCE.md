# RailGuard AI Governance Model

## Core principle

**AI recommends. Humans control railway decisions.**

## Control objectives

### RG-HITL-001: Human approval required
No operational or passenger-facing action may progress from recommendation to execution without an accountable human decision.

### RG-EXP-001: Explainability
The reviewer must be able to see the recommendation, confidence level and rationale before deciding.

### RG-AUD-001: Evidence trail
The system retains a timestamped record of detection, assessment, recommendation, approval or rejection, execution status and verification.

### RG-OVR-001: Override and contestability
The human controller may reject the recommendation, request revision or hold action.

### RG-FAIL-001: Fail safe
When evidence is incomplete or confidence is below threshold, the system escalates rather than autonomously acting.

### RG-COM-001: Passenger communication control
Customer-facing messages must be based on verified operational facts and cannot be released before the relevant human approval gate is satisfied.

## Evidence fields

- correlation ID
- incident ID
- timestamp
- source indicators
- model confidence
- recommendation
- rationale
- accountable role
- decision
- before state
- action
- after state
- verification
- evidence export timestamp

## Important limitation

This portfolio prototype demonstrates governance concepts only. It is not a safety-certified railway system and must not be represented as one.
