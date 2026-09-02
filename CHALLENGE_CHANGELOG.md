# WebMCP Challenge change record

Palm92 Lead Recovery OS existed as a demonstration dashboard before the WebMCP Challenge opened on 25 August 2026. The work below was added during the challenge period and is the portion submitted for judging.

## Competition-period additions

- Registered seven client-side tools with `document.modelContext.registerTool`.
- Connected the tools to the same live in-browser state used by the human-facing dashboard.
- Added narrow JSON input schemas and effect annotations.
- Added the Daniel Reed £2,400 missed-call recovery scenario.
- Required an explicit customer response and confirmed requirement before qualification.
- Added appointment availability lookup and appointment preparation.
- Kept final booking outside the agent toolset and behind a visible human approval button.
- Added a session audit trail and WebMCP discovery diagnostics.
- Added a dedicated WebMCP Test view, exact testing prompt and readiness checklist.
- Added automated tests for tool registration, execution, state changes and the human approval boundary.
- Added clear demonstration-data and integration disclosures.

## Dated source evidence

The source history records the challenge work in commits dated 29 to 31 August 2026, including:

- `5b19ebb` Add WebMCP lead recovery and human approval demo
- `e5e2e62` Unify lead metrics and verify WebMCP data actions
- `ad902da` Repair production WebMCP registration and diagnostics
- `b23b7d6` Finalize WebMCP recovery workflow and deployment checks
- `f74e4b8` Add WebMCP deployment readiness checklist
- `6c8956c` Enforce evidence-based recovery and human approval

The earlier July commits document the pre-existing dashboard and provide a clear baseline for comparison.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. Then open the deployed app in a WebMCP-capable ChatGPT in-app browser and follow the README test scenario.
