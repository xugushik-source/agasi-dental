# Report template

The agent renders `reports/seo-audit-<YYYY-MM-DD>.md` using the shape:

```markdown
# SEO audit · 2026-05-26

**Overall score:** 78 / 100

## Per-page summary

| Path     | Score | Status |
| -------- | ----- | ------ |
| `/`      | 95    | OK     |
| `/about` | 70    | WARN   |

## Findings

### `/about`

- ⚠️ **title-length** — Title length 22 chars — recommend 30–60
- ❌ **h1-present** — No <h1> on the page

<!-- agent-summary: { "score": 78, "pages": 12 } -->
```

The `<!-- agent-summary -->` comment is parsed by subsequent runs to
plot a trend; keep its shape stable.
