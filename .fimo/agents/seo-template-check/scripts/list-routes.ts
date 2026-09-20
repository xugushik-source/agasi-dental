/**
 * Tool: list-routes
 *
 * Enumerate every public route in the project via the Fimo management
 * API. Returns paths the audit walks one-by-one through `fetch-page`.
 *
 * Inputs (branch):
 *   - FIMO_PROJECT_ID — provided by the runtime (M16 sandbox adapter)
 *   - FIMO_ENV        — provided by the runtime (legacy runtime selector)
 *   - FIMO_API_URL    — provided by the runtime
 *
 * Outputs (stdout JSON):
 *   { "routes": [{ "path": "/", "label": "Home" }, ...] }
 */

interface Route {
  path: string;
  label: string;
}

async function main(): Promise<void> {
  const projectId = process.env.FIMO_PROJECT_ID;
  const env = process.env.FIMO_ENV ?? 'main';
  const base = process.env.FIMO_API_URL ?? 'http://localhost:3000';

  if (!projectId) {
    console.error('FIMO_PROJECT_ID is required');
    process.exit(1);
  }

  const url = `${base}/api/management/projects/${projectId}/branches/${encodeURIComponent(env)}/routes`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    console.error(`Failed to list routes: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const payload = (await res.json()) as { data?: { routes?: Record<string, Route> } };
  const routes = Object.values(payload.data?.routes ?? {});
  process.stdout.write(JSON.stringify({ routes }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
