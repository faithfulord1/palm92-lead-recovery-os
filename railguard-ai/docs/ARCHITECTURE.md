# RailGuard AI Architecture

## Purpose

RailGuard AI separates decision support from operational authority. The AI layer may classify, summarise, rank and recommend. Execution remains governed by explicit human approval.

## Logical layers

1. **Signal Intake**
   - service disruption indicators
   - incident metadata
   - simulated passenger impact indicators
   - accessibility impact indicators

2. **AI Decision-Support Layer**
   - incident classification
   - confidence scoring
   - impact assessment
   - recommendation generation
   - passenger-message drafting

3. **Governance Layer**
   - policy thresholds
   - human approval gate
   - override / rejection path
   - confidence threshold checks
   - data minimisation checks

4. **Execution Boundary**
   - no automatic operational command
   - no passenger-facing release before approval
   - simulated downstream release only after policy gate passes

5. **Evidence Layer**
   - correlation ID
   - timestamped events
   - recommendation rationale
   - human decision
   - before and after state
   - verification result
   - evidence export

## Portfolio MVP technical design

The current version is intentionally dependency-free so it can run locally or on static hosting. It uses HTML, CSS and JavaScript with browser local storage for simulated decision state.

A production implementation would require authenticated users, role-based access, signed audit records, secure APIs, data contracts, model monitoring, railway system integration controls, operational resilience and formal safety / assurance review.
