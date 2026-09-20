# SEO audit

Audit the project's pages for SEO health and deliver the findings as your session report.

## Inputs

- The project's published routes (via `scripts/list-routes.ts`)
- Each page's HTML + response headers (via `scripts/fetch-page.ts`)
- The current analytics data (read-only, via `fimo:analytics:read`)

## What to check (per page)

1. **Title tag** — present, 30–60 chars, unique across routes
2. **Meta description** — present, 50–160 chars, unique
3. **Open Graph** — `og:title`, `og:description`, `og:image`, `og:url`
4. **Schema.org** — at minimum `WebPage`; `Article` on blog posts;
   `BreadcrumbList` on nested routes
5. **Headings** — exactly one `h1`; `h2`/`h3` nest correctly
6. **Canonical URL** — `<link rel="canonical">` present and self-referential
7. **Robots / X-Robots-Tag** — not `noindex` on routes that should be indexed
8. **Sitemap** — every route is present in `/sitemap.xml`

## What to produce

Deliver the audit as your final session report — Fimo renders your last
message as the report, so you do not have (and do not need) write access.
Structure it as:

- An executive summary (score / 100, top 3 issues)
- A per-page table with status chips (✅ / ⚠️ / ❌)
- A "fix recipes" appendix linking each failure to the smallest change
  that would resolve it
- A diff-friendly machine-readable footer (`<!-- agent-summary: ... -->`)
  so subsequent runs can show the trend

## What NOT to do

- This audit is strictly read-only. Don't attempt to write files, create a
  report file, or commit — and don't mention capabilities or write access in
  the report itself. The report is your final message, nothing more.
- Don't fetch external URLs other than the project's own domain.
- Don't include traffic / conversion data in the report — it lives
  elsewhere in the Fimo dashboard.
