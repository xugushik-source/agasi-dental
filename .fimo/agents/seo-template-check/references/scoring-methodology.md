# Scoring methodology

A page starts at 100 points and loses:

- **-15** per `fail` finding (missing title, missing `<h1>`, `noindex` on a public page, etc.)
- **-5** per `warn` finding (length out of range, missing OG tag, no canonical, etc.)

The overall project score is the arithmetic mean of per-page scores.

## Severity guide

| Rule             | Severity  | Why                                                                  |
| ---------------- | --------- | -------------------------------------------------------------------- |
| title-present    | fail      | Without a title, search snippets fall back to the URL — costly       |
| title-length     | warn      | Outside 30–60 chars, Google truncates or pads — still ranks          |
| description-\*   | warn/fail | Less impact on rank but huge impact on CTR                           |
| og-{title,image} | warn      | Affects social shares only; no SEO rank impact                       |
| h1-present       | fail      | Page has no semantic root — both screen-readers and search hurt      |
| h1-single        | warn      | Multiple h1s — accessibility lint, not a ranking penalty             |
| canonical        | warn      | Self-referential canonical is best practice; rarely required         |
| robots-noindex   | fail      | Page explicitly excluded from index — review and remove if a mistake |
| schema-org       | warn      | Missing rich-result eligibility — won't hurt rank but loses CTR      |

## How the agent should act on findings

Don't write to project files in v1. Instead, the report's "fix recipes"
appendix should link to the file the agent suspects is responsible (e.g.
"fix this in `src/routes/[slug].tsx`'s `meta` export"). A follow-up
agent — the one that resolves recipes into actual PRs — is the
appropriate writer.
