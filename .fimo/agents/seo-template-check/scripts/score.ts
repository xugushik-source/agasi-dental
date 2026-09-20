/**
 * Tool: score
 *
 * Apply the SEO scoring methodology (see references/scoring-methodology.md)
 * to a list of `(path, SEOSignals)` tuples and produce a per-page report.
 *
 * Inputs (stdin JSON): { signals: Record<path, SEOSignals> }
 * Outputs (stdout JSON): { score: 0..100, pages: PageReport[] }
 */

interface SEOSignals {
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  openGraph: Record<string, string>;
  schemaOrg: unknown[];
  headings: { h1: string[]; h2: string[]; h3: string[] };
}

interface Finding {
  rule: string;
  severity: 'ok' | 'warn' | 'fail';
  message: string;
}

interface PageReport {
  path: string;
  score: number;
  findings: Finding[];
}

function audit(signals: SEOSignals): Finding[] {
  const out: Finding[] = [];

  // Title
  if (!signals.title) {
    out.push({ rule: 'title-present', severity: 'fail', message: 'Missing <title>' });
  } else if (signals.title.length < 30 || signals.title.length > 60) {
    out.push({
      rule: 'title-length',
      severity: 'warn',
      message: `Title length ${signals.title.length} chars — recommend 30–60`,
    });
  } else {
    out.push({ rule: 'title', severity: 'ok', message: 'Title looks good' });
  }

  // Description
  if (!signals.description) {
    out.push({ rule: 'description-present', severity: 'fail', message: 'Missing meta description' });
  } else if (signals.description.length < 50 || signals.description.length > 160) {
    out.push({
      rule: 'description-length',
      severity: 'warn',
      message: `Description length ${signals.description.length} chars — recommend 50–160`,
    });
  }

  // OG tags
  for (const key of ['title', 'description', 'image', 'url']) {
    if (!signals.openGraph[key]) {
      out.push({ rule: `og-${key}`, severity: 'warn', message: `Missing og:${key}` });
    }
  }

  // Headings
  if (signals.headings.h1.length === 0) {
    out.push({ rule: 'h1-present', severity: 'fail', message: 'No <h1> on the page' });
  } else if (signals.headings.h1.length > 1) {
    out.push({ rule: 'h1-single', severity: 'warn', message: `Multiple <h1> tags (${signals.headings.h1.length})` });
  }

  // Canonical
  if (!signals.canonical) {
    out.push({ rule: 'canonical', severity: 'warn', message: 'Missing canonical link' });
  }

  // Robots
  if (signals.robots && /noindex/i.test(signals.robots)) {
    out.push({ rule: 'robots-noindex', severity: 'fail', message: 'Page is marked noindex' });
  }

  // Schema.org
  if (signals.schemaOrg.length === 0) {
    out.push({ rule: 'schema-org', severity: 'warn', message: 'No JSON-LD schema.org block' });
  }

  return out;
}

function scoreOf(findings: Finding[]): number {
  // Each fail = -15, each warn = -5. Floor at 0.
  let pts = 100;
  for (const f of findings) {
    if (f.severity === 'fail') {
      pts -= 15;
    } else if (f.severity === 'warn') {
      pts -= 5;
    }
  }
  return Math.max(0, pts);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const text = await readStdin();
  const payload = JSON.parse(text) as { signals: Record<string, SEOSignals> };

  const pages: PageReport[] = [];
  for (const [path, signals] of Object.entries(payload.signals)) {
    const findings = audit(signals);
    pages.push({ path, score: scoreOf(findings), findings });
  }

  const overall = pages.length === 0 ? 0 : Math.round(pages.reduce((a, p) => a + p.score, 0) / pages.length);

  process.stdout.write(JSON.stringify({ score: overall, pages }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
