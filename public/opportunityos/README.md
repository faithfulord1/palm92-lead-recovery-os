# PALM92 OpportunityOS

**Relationship & Revenue Intelligence** | From attention to accountable business growth.

This is PALM92's original, free-first prototype for analysing authorised customer enquiries, identifying relevant opportunities and preparing human-approved follow-ups. It is not a clone of a third-party AI employee.

## Demo
- Application: [public/opportunityos/index.html](index.html) (single self-contained HTML file)
- Reusable skill: [docs/opportunityos/SKILL.md](../../docs/opportunityos/SKILL.md)
- Work tracker: [Issue #3](../../issues/3)

## Test locally
Download **index.html** and open it in a modern browser. This version runs locally without a subscription, a network connection or an API key. Start with the fictional demo leads. Review a score and its reasons, edit the reply, approve it, copy it, manually send outside this app, then record the action and review reports.

The first prototype was browser smoke-tested on desktop and mobile, including adding an enquiry, approval, marking contacted, reports, JSON export and no page errors. This is not security testing or an external integration test.

## Current product capabilities
- Manual LinkedIn/email/WhatsApp/website enquiry capture and CSV import, without scraping
- Evidence-linked 0–100 prioritisation (heuristics, not probabilities)
- Editable rule-based reply drafts with human approval and an audit trail
- Pipeline, follow-up planning, basic analytics and local CSV/JSON backup
- Fictional demo examples and browser-local storage

## Important limits
**Prototype only.** Browser localStorage is not encrypted, authenticated or multi-tenant. No generative AI, actual inbox connection or automatic sending is active. Do not place real private customer data into a public GitHub repo or this unsecured demo. This is not proof of UK GDPR compliance.

## Next build priorities
1. Verify import/export edge cases and regression tests after branding changes.
2. Add authenticated, isolated server-side client workspaces before any real customer data.
3. Add permission-based inbox/CRM connectors and optional secure AI drafting with a clear human confirmation boundary.
4. Pilot with one small business and measure real qualified replies, meetings and attributable revenue.

## Branding
**PALM92 OpportunityOS** is a provisional working product name. Independent products also use the shorter term "OpportunityOS"; perform a formal trademark and domain clearance before commercial release. The old prototype name may still appear in legacy browser storage namespaces to preserve existing local test data.
