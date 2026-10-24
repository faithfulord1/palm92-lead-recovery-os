# Security and Governance

Palm92 Lead Recovery OS is a synthetic demonstration of governed lead recovery and WebMCP tooling. It is intentionally designed so that an agent can investigate and prepare work without silently completing a consequential customer action.

## Trust boundaries

- Demo customer names, phone numbers, values and appointment slots are synthetic.
- WebMCP tools operate against current page state only.
- `prepare_follow_up` creates a draft but does not send a message.
- `recover_lead` requires an explicitly supplied customer response and service requirement. The tool must not invent consent or a reply.
- `find_available_appointments` reads availability only.
- `prepare_appointment` prepares a booking for human approval.
- The visible human approval control is the final authority for the demonstration booking.
- A pending approval is bound to the exact lead, slot, customer response, requirement and evidence timestamp shown to the reviewer. Any change invalidates that approval and requires a fresh preparation step.
- Selecting **Not yet** clears the pending approval and records that no booking was made.
- Audit events record important tool and approval transitions for explainability.

## Production requirements

Before connecting this demonstration to real customers, add authenticated server-side APIs, durable storage, role-based access control, consent records, retention rules, secrets management, rate limiting, provider webhooks and monitoring. Real SMS, phone, CRM and calendar providers should be called from trusted server-side services rather than browser code.

Never expose Twilio, Vapi, OpenAI, calendar, CRM or database credentials in client-side JavaScript.

The demonstration pins Next.js and `eslint-config-next` to 16.4.3. Run `npm audit`, tests, lint and the production build before accepting dependency updates.

## Human-in-the-loop principle

**AI investigates and prepares. Humans approve consequential customer actions.**

This boundary is part of the product design, not merely a demo disclaimer.
