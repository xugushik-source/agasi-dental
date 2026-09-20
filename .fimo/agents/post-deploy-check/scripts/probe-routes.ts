/**
 * Tool: probe-routes
 *
 * Fetch a list of critical routes and assert that each one responds
 * with a 2xx. Optionally checks that a known selector is present.
 *
 * Inputs (argv): JSON array of `{ url, selector? }`
 * Outputs (stdout JSON): { ok: number; failed: { url: string; status: number; reason: string }[] }
 */

interface Probe {
  url: string;
  selector?: string;
}

interface Result {
  ok: number;
  failed: { url: string; status: number; reason: string }[];
}

async function probe(p: Probe): Promise<{ url: string; status: number; reason: string } | null> {
  const res = await fetch(p.url, { redirect: 'manual' });
  if (res.status < 200 || res.status >= 300) {
    return { url: p.url, status: res.status, reason: `non-2xx status ${res.status}` };
  }
  if (p.selector) {
    const body = await res.text();
    if (!body.includes(p.selector)) {
      return { url: p.url, status: res.status, reason: `expected selector "${p.selector}" not found` };
    }
  }
  return null;
}

async function main(): Promise<void> {
  const raw = process.argv[2] ?? '[]';
  const probes = JSON.parse(raw) as Probe[];
  const result: Result = { ok: 0, failed: [] };
  for (const p of probes) {
    const failure = await probe(p);
    if (failure) {
      result.failed.push(failure);
    } else {
      result.ok += 1;
    }
  }
  process.stdout.write(JSON.stringify(result));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
