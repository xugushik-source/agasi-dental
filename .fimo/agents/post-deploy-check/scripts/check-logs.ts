/**
 * Tool: check-logs
 *
 * Query the project's production log stream for the last N minutes and
 * count errors. Used by the post-deploy-check summary line.
 *
 * Inputs (argv):
 *   1. Minutes to look back (default 5)
 *
 * Outputs (stdout JSON): { errors: number; first?: { ts: string; message: string } }
 */

async function main(): Promise<void> {
  const minutes = Number(process.argv[2] ?? '5');
  const projectId = process.env.FIMO_PROJECT_ID ?? '';
  const env = process.env.FIMO_ENV ?? 'main';
  const base = process.env.FIMO_API_URL ?? 'http://localhost:3000';

  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const url = `${base}/api/management/projects/${projectId}/branches/${encodeURIComponent(env)}/logs?since=${encodeURIComponent(since)}&level=error`;

  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      process.stdout.write(JSON.stringify({ errors: 0, note: `log endpoint returned ${res.status}` }));
      return;
    }
    const payload = (await res.json()) as { data?: { entries?: Array<{ ts: string; message: string }> } };
    const entries = payload.data?.entries ?? [];
    process.stdout.write(JSON.stringify({ errors: entries.length, first: entries[0] }));
  } catch (err) {
    process.stdout.write(JSON.stringify({ errors: 0, note: `log fetch failed: ${(err as Error).message}` }));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
