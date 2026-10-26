# FORGE evidence: approval integrity

Date: 2026-10-24

## Verified problem

The demonstration correctly required a visible human approval before booking, but the pending approval stored only a lead ID and slot label. A new customer response or requirement could be recorded after preparation while the old approval remained available.

## Change

Palm92 now stores qualification evidence separately and binds each pending approval to the exact:

- lead;
- slot ID and label;
- customer response;
- confirmed requirement; and
- evidence timestamp.

The approval screen displays the response and requirement being reviewed. The final action revalidates the current lead, evidence snapshot and slot. A mismatch expires the approval and requires preparation again. Selecting **Not yet** clears the pending approval and creates an audit event without booking.

## Verification

The regression test qualifies a fictional lead, prepares an appointment, then changes the response and requirement before clicking approve. The expected result is an expired-approval message, 23 appointments still booked and £7,050 recovered revenue unchanged.

The dependency audit initially reported one critical, four high and one moderate finding in the existing Next.js and transitive dependency tree. Next.js and its matching ESLint configuration were upgraded from 16.2.10 to the fixed 16.4.3 release, compatible transitive packages were refreshed, and the repeated audit reported zero known vulnerabilities.

## Limit

This is an in-browser fictional demonstration. Production use still requires authenticated server-side state, durable audit storage, concurrency control, access control, retention rules and authorised messaging/calendar integrations.
