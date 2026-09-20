# Broken-link sweeper

Crawl the project's published site once a week, find every broken link
(404s on internal routes, dead external destinations), classify them by
the page they live on, and propose a per-page fix on its own branch.

## Inputs

- The project's `sitemap.xml`, fetched from the published origin.
- Each page's HTML, fetched fresh on every run.
- The project's analytics (read-only) — used to rank which pages to
  triage first when the broken-link count is large.

## What to do

1. Fetch `sitemap.xml` and enumerate the canonical URL set.
2. For each URL, fetch the HTML and collect every `<a href>` plus every
   `<link rel="canonical">` and every `<img src>` target.
3. Classify each link:
   - **internal-404** — same-origin route that returns 4xx.
   - **external-dead** — third-party host that returns 4xx/5xx or
     times out after a reasonable retry.
   - **internal-redirect** — internal route that 301s to a different
     path (worth flagging, not always worth fixing).
4. Group findings by the source page that contains them.
5. For each affected page, open a fresh branch off `main` and commit a
   draft fix:
   - **internal-404** → propose a route alias or update the link to the
     closest live route (if the analytics show traffic to the dead path,
     prefer the alias; otherwise update in place).
   - **external-dead** → remove the link and replace its anchor text
     with plain text, leaving a TODO comment for a human to revisit.
   - **internal-redirect** → update the link to the canonical target.
6. Open one `agent_branch_proposal` per affected page so the owner can
   review each batch independently.

## What to produce

- One branch per affected page, named `agent/broken-links/<page-slug>`.
- One proposal per branch summarising the findings and the fix.
- A single run report at `reports/broken-links-<YYYY-MM-DD>.md` with
  the overall counts, the top 5 dead external destinations, and a
  trend footer (`<!-- agent-summary: ... -->`) for diffing across
  runs.

## What NOT to do

- Don't merge any branch — every fix goes through human review.
- Don't follow `noindex` or `disallow`'d routes; respect the project's
  robots policy.
- Don't fetch a URL more than once per run, and back off on 5xx.
