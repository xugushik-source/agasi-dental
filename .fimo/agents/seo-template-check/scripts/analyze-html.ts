/**
 * Tool: analyze-html
 *
 * Extract SEO signals from HTML — title, meta description, OG tags,
 * schema.org JSON-LD, heading structure, canonical, robots directive.
 * Returns a structured shape `score.ts` consumes.
 *
 * Inputs (stdin): HTML body
 * Outputs (stdout JSON): SEOSignals
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

function getMatch(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m && m[1] ? m[1].trim() : null;
}

function getAllMatches(html: string, regex: RegExp): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(regex)) {
    if (m[1]) {
      out.push(m[1].trim());
    }
  }
  return out;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const html = await readStdin();

  const openGraph: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']*)["']/gi)) {
    openGraph[m[1]!] = m[2] ?? '';
  }

  const schemaOrg: unknown[] = [];
  for (const m of html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      schemaOrg.push(JSON.parse(m[1]!.trim()));
    } catch {
      // skip invalid JSON-LD blocks
    }
  }

  const signals: SEOSignals = {
    title: getMatch(html, /<title>([\s\S]*?)<\/title>/i),
    description: getMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i),
    canonical: getMatch(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i),
    robots: getMatch(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i),
    openGraph,
    schemaOrg,
    headings: {
      h1: getAllMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map((s) => s.replace(/<[^>]+>/g, '').trim()),
      h2: getAllMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map((s) => s.replace(/<[^>]+>/g, '').trim()),
      h3: getAllMatches(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).map((s) => s.replace(/<[^>]+>/g, '').trim()),
    },
  };

  process.stdout.write(JSON.stringify(signals, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
