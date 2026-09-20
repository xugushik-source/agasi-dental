# Post-deploy check

Run a quick health probe every time the project deploys, and post a
summary back to the deploy log. Triggered automatically by the
`deploy.succeeded` event.

## What to do

1. Read the routes the deploy declares as critical (`probe-routes.ts`).
2. For each one, fetch and assert that the response is 2xx and renders
   the expected key element (a known DOM selector).
3. Read the last 5 minutes of production logs (`check-logs.ts`) and
   surface any errors emitted during the deploy window.
4. Write a single-line summary to stdout that the deploy notification
   includes verbatim. Examples:
   - `✅ 12 routes pass · 0 errors`
   - `❌ /pricing failed (500) · 3 errors in last 5min`

## What NOT to do

- Don't roll back the deploy — that's a separate human-in-the-loop
  decision; this agent only reports.
- Don't write to CMS or files. Read-only probes plus log reads.
