# Palm92 Lead Recovery OS

Palm92 is a WebMCP-enabled lead-recovery workspace for local service businesses. It shows how a person and an AI agent can inspect missed-call opportunities, prepare a follow-up, record an explicit customer response, qualify the requirement, find appointment availability and prepare an appointment for human approval.

## Live challenge demo

- App: https://palm92-lead-recovery.faithfulord1.chatgpt.site/
- Test scenario: Daniel Reed, missed kitchen-quote call, estimated value £2,400
- Required outcome: the agent may investigate and prepare an appointment, but only the visible human approval control can confirm the demonstration booking

For dated evidence separating the original dashboard from the competition work, see [CHALLENGE_CHANGELOG.md](CHALLENGE_CHANGELOG.md).

## WebMCP challenge extension

Palm92 existed before the WebMCP Challenge. During the challenge submission period it was meaningfully extended with JavaScript WebMCP tools registered through `document.modelContext.registerTool`. The dated commit history distinguishes this work from the earlier dashboard.

The page registers seven tools:

- `get_unrecovered_leads`
- `get_lead_details`
- `prepare_follow_up`
- `recover_lead`
- `find_available_appointments`
- `prepare_appointment`
- `get_recovery_summary`

The tools share the same in-browser state as the human-facing dashboard. Inputs use narrow JSON schemas, effects are described with annotations, and appointment booking cannot be completed by a WebMCP tool. The final booking requires the visible Palm92 human approval control.

## Data and capability disclosure

This competition build uses a clearly identified fictional demonstration dataset, including the Daniel Reed kitchen-quote scenario. All customer names, telephone numbers and records are fictional; telephone numbers use the unmistakable `07XXX XXXXXX` placeholder. It does not claim to send a real SMS, contact a customer, update an external CRM or book an external calendar. `prepare_follow_up` only drafts text. A customer response and requirement must be supplied explicitly before a lead can be qualified. `prepare_appointment` only creates an approval request.

## Test with ChatGPT site tools

1. Deploy the application to a public HTTPS URL.
2. Open the latest ChatGPT desktop app using GPT-5.6 Sol or GPT-5.6 Terra.
3. Open the deployed URL in ChatGPT's built-in browser.
4. Select **Site tools** in the address bar and inspect the seven Palm92 tools.
5. Ask the agent to find today's highest-value unrecovered lead and prepare an appointment.
6. Confirm that the agent stops before booking and asks for human approval.
7. Approve through the visible Palm92 button and confirm the dashboard updates once.

Suggested test prompt:

> Find today's unrecovered leads. Identify the highest-value opportunity and help me recover it. Use the Palm92 site tools to inspect the lead, prepare the follow-up, qualify the opportunity, check appointment availability and prepare the appointment. Stop and ask for my approval before making the final booking.

Site tools are not available in a normal browser tab, the Android app, GPT-5.6 Luna, or Enterprise and Edu workspaces.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the automated checks with:

```bash
npm test
npm run lint
npm run build
```

## Production integrations

For a client deployment, connect authorised server-side integrations for messaging, voice, calendars, CRM and durable audit storage. Keep credentials in hosted environment variables and enforce the same human approval boundary server-side.

- Twilio or Vapi for phone calls and SMS
- OpenAI API for voice and lead qualification
- Cal.com or Google Calendar for booking
- HubSpot Free for CRM
- n8n for workflow automation
- Supabase for durable data and audit history

Never expose API keys in client-side code. Add integrations through server route handlers and environment variables.

## Licence

Released under the MIT License. See [LICENSE](LICENSE).
